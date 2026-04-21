type RequestBody = {
  name: string;
  registration: string;
  status: "paid" | "unpaid";
  photoBase64: string;
};

// ===== HARD CODE =====
const CONNECTOR_URL = "https://chilly-grapes-look.loca.lt";
const PORTAL_ID = 1;

const ACTIVE_GROUP_NAME = "ALUNOS_ATIVOS";
const BLOCKED_GROUP_NAME = "ALUNOS_BLOQUEADOS";

const ALLOW_RULE_NAME = "REGRA_LIBERAR_GYM";
const BLOCK_RULE_NAME = "REGRA_BLOQUEAR_GYM";

const NORMAL_TIMEZONE_NAME = "HORARIO_GYM_NORMAL";
const BLOCKED_TIMEZONE_NAME = "HORARIO_GYM_BLOQUEADO";

async function connectorLogin() {
  const response = await fetch(`${CONNECTOR_URL}/login`, {
    method: "GET",
    cache: "no-store"
  });

  return response.json();
}

async function connectorJson(path: string, body: any) {
  const response = await fetch(`${CONNECTOR_URL}/request-json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ path, body }),
    cache: "no-store"
  });

  return response.json();
}

async function connectorImage(userId: number, photoBase64: string) {
  const response = await fetch(`${CONNECTOR_URL}/request-image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ userId, photoBase64 }),
    cache: "no-store"
  });

  return response.json();
}

function getRows(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;

  if (payload.data && typeof payload.data === "object") {
    for (const value of Object.values(payload.data)) {
      if (Array.isArray(value)) return value;
    }
  }

  return [];
}

async function loadObject(object: string) {
  return connectorJson("/load_objects.fcgi", { object });
}

async function createObject(object: string, values: any[]) {
  return connectorJson("/create_objects.fcgi", { object, values });
}

async function destroyObject(object: string, where: any) {
  return connectorJson("/destroy_objects.fcgi", { object, where });
}

async function ensureGroup(name: string) {
  const res = await loadObject("groups");
  const groups = getRows(res);
  const found = groups.find((item) => String(item.name || "").trim() === name);
  if (found) return Number(found.id);

  const created = await createObject("groups", [{ name }]);
  return Number(created.data.ids[0]);
}

async function ensureAccessRule(name: string, type: 0 | 1) {
  const res = await loadObject("access_rules");
  const rows = getRows(res);
  const found = rows.find(
    (item) => String(item.name || "").trim() === name && Number(item.type) === type
  );
  if (found) return Number(found.id);

  const created = await createObject("access_rules", [
    {
      name,
      type,
      priority: 0
    }
  ]);

  return Number(created.data.ids[0]);
}

async function ensureTimeZone(name: string) {
  const res = await loadObject("time_zones");
  const rows = getRows(res);
  const found = rows.find((item) => String(item.name || "").trim() === name);
  if (found) return Number(found.id);

  const created = await createObject("time_zones", [{ name }]);
  return Number(created.data.ids[0]);
}

async function ensureTimeSpan(
  timeZoneId: number,
  span: {
    start: number;
    end: number;
    sun: number;
    mon: number;
    tue: number;
    wed: number;
    thu: number;
    fri: number;
    sat: number;
    hol1: number;
    hol2: number;
    hol3: number;
  }
) {
  const res = await loadObject("time_spans");
  const rows = getRows(res);

  const found = rows.find(
    (item) =>
      Number(item.time_zone_id) === timeZoneId &&
      Number(item.start) === span.start &&
      Number(item.end) === span.end
  );

  if (found) return Number(found.id);

  const created = await createObject("time_spans", [
    {
      time_zone_id: timeZoneId,
      ...span
    }
  ]);

  return Number(created.data.ids[0]);
}

async function ensureLink(
  object: string,
  row: any,
  matcher: (item: any) => boolean
) {
  const res = await loadObject(object);
  const rows = getRows(res);
  const found = rows.find(matcher);
  if (found) return;

  await createObject(object, [row]);
}

async function ensureInfrastructure() {
  const activeGroupId = await ensureGroup(ACTIVE_GROUP_NAME);
  const blockedGroupId = await ensureGroup(BLOCKED_GROUP_NAME);

  const allowRuleId = await ensureAccessRule(ALLOW_RULE_NAME, 1);
  const blockRuleId = await ensureAccessRule(BLOCK_RULE_NAME, 0);

  const normalTimeZoneId = await ensureTimeZone(NORMAL_TIMEZONE_NAME);
  const blockedTimeZoneId = await ensureTimeZone(BLOCKED_TIMEZONE_NAME);

  // horário normal: 05:00 até 23:00
  await ensureTimeSpan(normalTimeZoneId, {
    start: 18000,
    end: 82800,
    sun: 1,
    mon: 1,
    tue: 1,
    wed: 1,
    thu: 1,
    fri: 1,
    sat: 1,
    hol1: 1,
    hol2: 1,
    hol3: 1
  });

  // horário bloqueado: 03:00 até 03:05
  await ensureTimeSpan(blockedTimeZoneId, {
    start: 10800,
    end: 11100,
    sun: 1,
    mon: 1,
    tue: 1,
    wed: 1,
    thu: 1,
    fri: 1,
    sat: 1,
    hol1: 1,
    hol2: 1,
    hol3: 1
  });

  await ensureLink(
    "access_rule_time_zones",
    {
      access_rule_id: allowRuleId,
      time_zone_id: normalTimeZoneId
    },
    (item) =>
      Number(item.access_rule_id) === allowRuleId &&
      Number(item.time_zone_id) === normalTimeZoneId
  );

  await ensureLink(
    "access_rule_time_zones",
    {
      access_rule_id: blockRuleId,
      time_zone_id: blockedTimeZoneId
    },
    (item) =>
      Number(item.access_rule_id) === blockRuleId &&
      Number(item.time_zone_id) === blockedTimeZoneId
  );

  await ensureLink(
    "group_access_rules",
    {
      group_id: activeGroupId,
      access_rule_id: allowRuleId
    },
    (item) =>
      Number(item.group_id) === activeGroupId &&
      Number(item.access_rule_id) === allowRuleId
  );

  await ensureLink(
    "group_access_rules",
    {
      group_id: blockedGroupId,
      access_rule_id: blockRuleId
    },
    (item) =>
      Number(item.group_id) === blockedGroupId &&
      Number(item.access_rule_id) === blockRuleId
  );

  await ensureLink(
    "portal_access_rules",
    {
      portal_id: PORTAL_ID,
      access_rule_id: allowRuleId
    },
    (item) =>
      Number(item.portal_id) === PORTAL_ID &&
      Number(item.access_rule_id) === allowRuleId
  );

  await ensureLink(
    "portal_access_rules",
    {
      portal_id: PORTAL_ID,
      access_rule_id: blockRuleId
    },
    (item) =>
      Number(item.portal_id) === PORTAL_ID &&
      Number(item.access_rule_id) === blockRuleId
  );

  return {
    activeGroupId,
    blockedGroupId,
    allowRuleId,
    blockRuleId,
    normalTimeZoneId,
    blockedTimeZoneId
  };
}

async function findUserByRegistration(registration: string) {
  const res = await loadObject("users");
  const rows = getRows(res);
  return rows.find(
    (item) => String(item.registration || "").trim() === registration.trim()
  );
}

async function createUser(name: string, registration: string) {
  const existing = await findUserByRegistration(registration);
  if (existing) {
    return Number(existing.id);
  }

  const created = await createObject("users", [
    {
      registration,
      name,
      password: ""
    }
  ]);

  return Number(created.data.ids[0]);
}

async function moveUserToGroup(userId: number, groupId: number) {
  await destroyObject("user_groups", {
    user_groups: {
      user_id: userId
    }
  });

  await createObject("user_groups", [
    {
      user_id: userId,
      group_id: groupId
    }
  ]);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (!body.name?.trim()) {
      return Response.json({ success: false, error: "Nombre obligatorio" }, { status: 400 });
    }

    if (!body.registration?.trim()) {
      return Response.json({ success: false, error: "Matrícula obligatoria" }, { status: 400 });
    }

    if (!body.photoBase64?.trim()) {
      return Response.json({ success: false, error: "Foto obligatoria" }, { status: 400 });
    }

    await connectorLogin();

    const infra = await ensureInfrastructure();

    const userId = await createUser(body.name, body.registration);

    const photoResult = await connectorImage(userId, body.photoBase64);

    const photoSuccess =
      photoResult?.data?.success === true ||
      photoResult?.data?.success === undefined;

    const targetGroupId =
      body.status === "paid" ? infra.activeGroupId : infra.blockedGroupId;

    await moveUserToGroup(userId, targetGroupId);

    return Response.json({
      success: true,
      userId,
      targetGroup: body.status === "paid" ? ACTIVE_GROUP_NAME : BLOCKED_GROUP_NAME,
      infrastructure: infra,
      photoResult
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: String(error)
      },
      { status: 500 }
    );
  }
}