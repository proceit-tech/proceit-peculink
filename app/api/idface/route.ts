type Action =
  | "createActiveStructure"
  | "createBlockedStructure"
  | "createUser"
  | "moveToBlocked"
  | "moveToActive"
  | "readAccess";

const CONNECTOR_URL = "https://pipes-richmond-european-miss.trycloudflare.com";

// AJUSTE AQUI SE O PORTAL DO EQUIPAMENTO NÃO FOR 1
const PORTAL_ID = 1;

// HORÁRIOS OFICIAIS
const ACTIVE_GROUP_NAME = "ALUNOS_ATIVOS";
const BLOCKED_GROUP_NAME = "ALUNOS_BLOQUEADOS";

const ACTIVE_RULE_NAME = "REGRA_ALUNOS_ATIVOS";
const BLOCKED_RULE_NAME = "REGRA_ALUNOS_BLOQUEADOS";

const ACTIVE_TIMEZONE_NAME = "HORARIO_NORMAL";
const BLOCKED_TIMEZONE_NAME = "HORARIO_BLOQUEIO";

// 04:00 -> 23:59
const ACTIVE_START_SECONDS = 4 * 3600; // 14400
const ACTIVE_END_SECONDS = 23 * 3600 + 59 * 60; // 86340

// 03:00 -> 03:05
const BLOCKED_START_SECONDS = 3 * 3600; // 10800
const BLOCKED_END_SECONDS = 3 * 3600 + 5 * 60; // 11100

type Body = {
  action: Action;
  payload?: any;
};

function logStep(step: string, data?: any) {
  if (data === undefined) {
    console.log(`[IDFACE] ${step}`);
    return;
  }

  try {
    console.log(`[IDFACE] ${step}`, JSON.stringify(data, null, 2));
  } catch {
    console.log(`[IDFACE] ${step}`, data);
  }
}

async function safeReadJsonResponse(response: Response, label: string) {
  const text = await response.text();

  logStep(`${label} -> HTTP STATUS`, response.status);
  logStep(`${label} -> RAW RESPONSE`, text);

  if (!text || !text.trim()) {
    throw new Error(`${label}: resposta vazia`);
  }

  try {
    const parsed = JSON.parse(text);
    logStep(`${label} -> PARSED RESPONSE`, parsed);
    return parsed;
  } catch {
    throw new Error(`${label}: resposta inválida: ${text}`);
  }
}

async function connectorJson(path: string, body: any) {
  const requestBody = {
    path,
    body,
  };

  logStep("connectorJson -> REQUEST", {
    url: `${CONNECTOR_URL}/device/json`,
    requestBody,
  });

  const response = await fetch(`${CONNECTOR_URL}/device/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
    cache: "no-store",
  });

  return safeReadJsonResponse(response, "connectorJson");
}

async function connectorImage(userId: number, photoBase64: string) {
  const requestBody = {
    userId,
    photoBase64Length: photoBase64?.length ?? 0,
  };

  logStep("connectorImage -> REQUEST", {
    url: `${CONNECTOR_URL}/device/image`,
    requestBody,
  });

  const response = await fetch(`${CONNECTOR_URL}/device/image`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      photoBase64,
    }),
    cache: "no-store",
  });

  return safeReadJsonResponse(response, "connectorImage");
}

function getRows(data: any): any[] {
  if (!data || typeof data !== "object") return [];

  for (const value of Object.values(data)) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

function normalizeName(value: any) {
  return String(value || "").trim();
}

function sortByTimeAsc(rows: any[]) {
  return [...rows].sort((a, b) => Number(a.time || 0) - Number(b.time || 0));
}

async function loadObject(object: string) {
  logStep("loadObject -> START", { object });

  const result = await connectorJson("/load_objects.fcgi", { object });

  logStep("loadObject -> CONNECTOR RESULT", result);

  if (!result.success) {
    throw new Error(
      `Falha ao carregar objeto ${object}: ${result.error || result.raw || "sem detalhe"}`
    );
  }

  const rows = getRows(result.data);

  logStep("loadObject -> EXTRACTED ROWS", {
    object,
    count: rows.length,
    rows,
  });

  return {
    raw: result.raw,
    data: result.data,
    rows,
  };
}

async function createObject(object: string, values: any[]) {
  logStep("createObject -> START", { object, values });

  const result = await connectorJson("/create_objects.fcgi", {
    object,
    values,
  });

  logStep("createObject -> CONNECTOR RESULT", result);

  if (!result.success) {
    throw new Error(
      `Falha ao criar ${object}: ${result.error || result.raw || "sem detalhe"}`
    );
  }

  return result.data;
}

async function destroyObject(object: string, where: any) {
  logStep("destroyObject -> START", { object, where });

  const result = await connectorJson("/destroy_objects.fcgi", {
    object,
    where,
  });

  logStep("destroyObject -> CONNECTOR RESULT", result);

  if (!result.success) {
    throw new Error(
      `Falha ao apagar ${object}: ${result.error || result.raw || "sem detalhe"}`
    );
  }

  return result.data;
}

async function ensureGroup(name: string) {
  const groups = await loadObject("groups");
  const found = groups.rows.find((row) => normalizeName(row.name) === name);

  if (found) {
    logStep("ensureGroup -> EXISTS", found);
    return Number(found.id);
  }

  const created = await createObject("groups", [{ name }]);
  logStep("ensureGroup -> CREATED", created);
  return Number(created.ids[0]);
}

async function ensureAccessRule(name: string) {
  const rules = await loadObject("access_rules");
  const found = rules.rows.find((row) => normalizeName(row.name) === name);

  if (found) {
    logStep("ensureAccessRule -> EXISTS", found);
    return Number(found.id);
  }

  const created = await createObject("access_rules", [
    {
      name,
      type: 1,
      priority: 0,
    },
  ]);

  logStep("ensureAccessRule -> CREATED", created);
  return Number(created.ids[0]);
}

async function ensureTimeZone(name: string) {
  const zones = await loadObject("time_zones");
  const found = zones.rows.find((row) => normalizeName(row.name) === name);

  if (found) {
    logStep("ensureTimeZone -> EXISTS", found);
    return Number(found.id);
  }

  const created = await createObject("time_zones", [{ name }]);
  logStep("ensureTimeZone -> CREATED", created);
  return Number(created.ids[0]);
}

async function ensureTimeSpan(params: {
  timeZoneId: number;
  start: number;
  end: number;
}) {
  const spans = await loadObject("time_spans");

  const found = spans.rows.find(
    (row) =>
      Number(row.time_zone_id) === Number(params.timeZoneId) &&
      Number(row.start) === Number(params.start) &&
      Number(row.end) === Number(params.end) &&
      Number(row.sun) === 1 &&
      Number(row.mon) === 1 &&
      Number(row.tue) === 1 &&
      Number(row.wed) === 1 &&
      Number(row.thu) === 1 &&
      Number(row.fri) === 1 &&
      Number(row.sat) === 1
  );

  if (found) {
    logStep("ensureTimeSpan -> EXISTS", found);
    return Number(found.id);
  }

  const created = await createObject("time_spans", [
    {
      time_zone_id: params.timeZoneId,
      start: params.start,
      end: params.end,
      sun: 1,
      mon: 1,
      tue: 1,
      wed: 1,
      thu: 1,
      fri: 1,
      sat: 1,
      hol1: 1,
      hol2: 1,
      hol3: 1,
    },
  ]);

  logStep("ensureTimeSpan -> CREATED", created);
  return Number(created.ids[0]);
}

async function ensureLink(params: {
  object: string;
  values: any;
  matcher: (row: any) => boolean;
}) {
  const rows = await loadObject(params.object);
  const found = rows.rows.find(params.matcher);

  if (found) {
    logStep(`ensureLink -> EXISTS (${params.object})`, found);
    return found;
  }

  const created = await createObject(params.object, [params.values]);
  logStep(`ensureLink -> CREATED (${params.object})`, created);
  return created;
}

async function createActiveStructure() {
  logStep("createActiveStructure -> START");

  const groupId = await ensureGroup(ACTIVE_GROUP_NAME);
  const ruleId = await ensureAccessRule(ACTIVE_RULE_NAME);
  const timeZoneId = await ensureTimeZone(ACTIVE_TIMEZONE_NAME);

  await ensureTimeSpan({
    timeZoneId,
    start: ACTIVE_START_SECONDS,
    end: ACTIVE_END_SECONDS,
  });

  await ensureLink({
    object: "access_rule_time_zones",
    values: {
      access_rule_id: ruleId,
      time_zone_id: timeZoneId,
    },
    matcher: (row) =>
      Number(row.access_rule_id) === ruleId &&
      Number(row.time_zone_id) === timeZoneId,
  });

  await ensureLink({
    object: "group_access_rules",
    values: {
      group_id: groupId,
      access_rule_id: ruleId,
    },
    matcher: (row) =>
      Number(row.group_id) === groupId &&
      Number(row.access_rule_id) === ruleId,
  });

  await ensureLink({
    object: "portal_access_rules",
    values: {
      portal_id: PORTAL_ID,
      access_rule_id: ruleId,
    },
    matcher: (row) =>
      Number(row.portal_id) === PORTAL_ID &&
      Number(row.access_rule_id) === ruleId,
  });

  return {
    groupId,
    groupName: ACTIVE_GROUP_NAME,
    ruleId,
    ruleName: ACTIVE_RULE_NAME,
    timeZoneId,
    timeZoneName: ACTIVE_TIMEZONE_NAME,
    window: {
      from: "04:00",
      to: "23:59",
      startSeconds: ACTIVE_START_SECONDS,
      endSeconds: ACTIVE_END_SECONDS,
    },
  };
}

async function createBlockedStructure() {
  logStep("createBlockedStructure -> START");

  const groupId = await ensureGroup(BLOCKED_GROUP_NAME);
  const ruleId = await ensureAccessRule(BLOCKED_RULE_NAME);
  const timeZoneId = await ensureTimeZone(BLOCKED_TIMEZONE_NAME);

  await ensureTimeSpan({
    timeZoneId,
    start: BLOCKED_START_SECONDS,
    end: BLOCKED_END_SECONDS,
  });

  await ensureLink({
    object: "access_rule_time_zones",
    values: {
      access_rule_id: ruleId,
      time_zone_id: timeZoneId,
    },
    matcher: (row) =>
      Number(row.access_rule_id) === ruleId &&
      Number(row.time_zone_id) === timeZoneId,
  });

  await ensureLink({
    object: "group_access_rules",
    values: {
      group_id: groupId,
      access_rule_id: ruleId,
    },
    matcher: (row) =>
      Number(row.group_id) === groupId &&
      Number(row.access_rule_id) === ruleId,
  });

  await ensureLink({
    object: "portal_access_rules",
    values: {
      portal_id: PORTAL_ID,
      access_rule_id: ruleId,
    },
    matcher: (row) =>
      Number(row.portal_id) === PORTAL_ID &&
      Number(row.access_rule_id) === ruleId,
  });

  return {
    groupId,
    groupName: BLOCKED_GROUP_NAME,
    ruleId,
    ruleName: BLOCKED_RULE_NAME,
    timeZoneId,
    timeZoneName: BLOCKED_TIMEZONE_NAME,
    window: {
      from: "03:00",
      to: "03:05",
      startSeconds: BLOCKED_START_SECONDS,
      endSeconds: BLOCKED_END_SECONDS,
    },
  };
}

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    logStep("POST /api/idface -> RAW REQUEST BODY", textBody);

    let body: Body;

    try {
      body = JSON.parse(textBody);
    } catch {
      return Response.json(
        {
          success: false,
          error: `Body inválido: ${textBody}`,
        },
        { status: 400 }
      );
    }

    const { action, payload } = body;

    logStep("POST /api/idface -> PARSED BODY", body);

    if (action === "createActiveStructure") {
      const structure = await createActiveStructure();

      return Response.json({
        success: true,
        ...structure,
      });
    }

    if (action === "createBlockedStructure") {
      const structure = await createBlockedStructure();

      return Response.json({
        success: true,
        ...structure,
      });
    }

    if (action === "createUser") {
      const name = normalizeName(payload?.name);
      const registration = normalizeName(payload?.registration);
      const photoBase64 = normalizeName(payload?.photoBase64);
      const activeGroupId = Number(payload?.activeGroupId);

      logStep("ACTION createUser -> START", {
        name,
        registration,
        activeGroupId,
        photoBase64Length: photoBase64.length,
      });

      if (!name) {
        return Response.json({ success: false, error: "Nome obrigatório" }, { status: 400 });
      }

      if (!registration) {
        return Response.json({ success: false, error: "Matrícula obrigatória" }, { status: 400 });
      }

      if (!photoBase64) {
        return Response.json({ success: false, error: "Foto obrigatória" }, { status: 400 });
      }

      if (!activeGroupId) {
        return Response.json(
          { success: false, error: "Crie a estrutura ativa antes" },
          { status: 400 }
        );
      }

      const users = await loadObject("users");

      const existing = users.rows.find(
        (row) => normalizeName(row.registration) === registration
      );

      let userId: number;

      if (existing) {
        userId = Number(existing.id);
        logStep("ACTION createUser -> USER EXISTS", existing);
      } else {
        const created = await createObject("users", [
          {
            name,
            registration,
            password: "",
          },
        ]);

        logStep("ACTION createUser -> USER CREATED", created);

        userId = Number(created.ids[0]);
      }

      const imageResult = await connectorImage(userId, photoBase64);

      logStep("ACTION createUser -> IMAGE RESULT", imageResult);

      if (!imageResult.success) {
        return Response.json({
          success: false,
          error: imageResult.error || "Falha ao enviar foto",
          detail: imageResult.raw,
        });
      }

      if (imageResult.data?.success === false) {
        return Response.json({
          success: false,
          error: "Foto rejeitada pelo iDFace",
          detail: imageResult.data,
        });
      }

      await destroyObject("user_groups", {
        user_groups: {
          user_id: userId,
        },
      });

      logStep("ACTION createUser -> REMOVED OLD GROUP LINKS", { userId });

      await createObject("user_groups", [
        {
          user_id: userId,
          group_id: activeGroupId,
        },
      ]);

      logStep("ACTION createUser -> LINKED USER TO ACTIVE GROUP", {
        userId,
        activeGroupId,
      });

      return Response.json({
        success: true,
        userId,
        currentGroupId: activeGroupId,
        currentGroupName: ACTIVE_GROUP_NAME,
        imageResult: imageResult.data,
      });
    }

    if (action === "moveToBlocked" || action === "moveToActive") {
      const userId = Number(payload?.userId);
      const targetGroupId = Number(payload?.targetGroupId);
      const targetGroupName = normalizeName(payload?.targetGroupName);

      logStep(`ACTION ${action} -> START`, {
        userId,
        targetGroupId,
        targetGroupName,
      });

      if (!userId) {
        return Response.json({ success: false, error: "userId obrigatório" }, { status: 400 });
      }

      if (!targetGroupId) {
        return Response.json({ success: false, error: "targetGroupId obrigatório" }, { status: 400 });
      }

      await destroyObject("user_groups", {
        user_groups: {
          user_id: userId,
        },
      });

      logStep(`ACTION ${action} -> REMOVED OLD GROUP LINKS`, { userId });

      await createObject("user_groups", [
        {
          user_id: userId,
          group_id: targetGroupId,
        },
      ]);

      logStep(`ACTION ${action} -> LINKED USER TO GROUP`, {
        userId,
        targetGroupId,
        targetGroupName,
      });

      return Response.json({
        success: true,
        userId,
        currentGroupId: targetGroupId,
        currentGroupName: targetGroupName,
      });
    }

    if (action === "readAccess") {
      const userId = Number(payload?.userId);

      logStep("ACTION readAccess -> START", { userId });

      if (!userId) {
        return Response.json({ success: false, error: "userId obrigatório" }, { status: 400 });
      }

      const logs = await loadObject("access_logs");

      const userLogs = sortByTimeAsc(
        logs.rows.filter((row) => Number(row.user_id) === userId)
      );

      logStep("ACTION readAccess -> USER LOGS", {
        userId,
        count: userLogs.length,
        userLogs,
      });

      const history = userLogs.map((row, index) => {
        const sequence = index + 1;
        const movement = sequence % 2 === 1 ? "ENTRADA" : "SAIDA";

        return {
          sequence,
          movement,
          time: Number(row.time || 0),
          portal_id: row.portal_id ?? null,
          event: row.event ?? null,
          confidence: row.confidence ?? null,
        };
      });

      const last = history.length > 0 ? history[history.length - 1] : null;

      logStep("ACTION readAccess -> RESOLVED HISTORY", {
        totalReads: history.length,
        lastMovement: last,
        history,
      });

      return Response.json({
        success: true,
        totalReads: history.length,
        lastMovement: last,
        history,
      });
    }

    return Response.json(
      { success: false, error: "Ação inválida" },
      { status: 400 }
    );
  } catch (error: any) {
    logStep("POST /api/idface -> ERROR", {
      message: error?.message || String(error),
      stack: error?.stack || null,
    });

    return Response.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}