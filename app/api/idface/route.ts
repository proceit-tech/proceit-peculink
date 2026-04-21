type Action =
  | "createActiveGroup"
  | "createBlockedGroup"
  | "createUser"
  | "moveToBlocked"
  | "moveToActive"
  | "readAccess";

const CONNECTOR_URL = "https://great-geese-listen.loca.lt";

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

function normalizeName(value: any) {
  return String(value || "").trim();
}

function sortByTimeAsc(rows: any[]) {
  return [...rows].sort((a, b) => Number(a.time || 0) - Number(b.time || 0));
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

    if (action === "createActiveGroup") {
      const name = normalizeName(payload?.groupName || "ALUNOS_ATIVOS");

      logStep("ACTION createActiveGroup -> START", { name });

      const groups = await loadObject("groups");

      const found = groups.rows.find((row) => normalizeName(row.name) === name);

      if (found) {
        logStep("ACTION createActiveGroup -> GROUP EXISTS", found);

        return Response.json({
          success: true,
          groupId: Number(found.id),
          groupName: name,
          existed: true,
        });
      }

      const created = await createObject("groups", [{ name }]);

      logStep("ACTION createActiveGroup -> GROUP CREATED", created);

      return Response.json({
        success: true,
        groupId: Number(created.ids[0]),
        groupName: name,
        existed: false,
      });
    }

    if (action === "createBlockedGroup") {
      const name = normalizeName(payload?.groupName || "ALUNOS_BLOQUEADOS");

      logStep("ACTION createBlockedGroup -> START", { name });

      const groups = await loadObject("groups");

      const found = groups.rows.find((row) => normalizeName(row.name) === name);

      if (found) {
        logStep("ACTION createBlockedGroup -> GROUP EXISTS", found);

        return Response.json({
          success: true,
          groupId: Number(found.id),
          groupName: name,
          existed: true,
        });
      }

      const created = await createObject("groups", [{ name }]);

      logStep("ACTION createBlockedGroup -> GROUP CREATED", created);

      return Response.json({
        success: true,
        groupId: Number(created.ids[0]),
        groupName: name,
        existed: false,
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
        return Response.json({ success: false, error: "Crie o grupo ativo antes" }, { status: 400 });
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
        currentGroupName: "ATIVOS",
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