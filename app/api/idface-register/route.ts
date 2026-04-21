type Action =
  | "createActiveGroup"
  | "createBlockedGroup"
  | "createUser"
  | "moveToBlocked"
  | "moveToActive"
  | "readAccess";

const CONNECTOR_URL = "https://petite-wings-grab.loca.lt";

type Body = {
  action: Action;
  payload?: any;
};

async function connectorJson(path: string, body: any) {
  const response = await fetch(`${CONNECTOR_URL}/device/json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      body,
    }),
    cache: "no-store",
  });

  return response.json();
}

async function connectorImage(userId: number, photoBase64: string) {
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

  return response.json();
}

function getRows(data: any): any[] {
  if (!data || typeof data !== "object") return [];

  for (const value of Object.values(data)) {
    if (Array.isArray(value)) return value;
  }

  return [];
}

async function loadObject(object: string) {
  const result = await connectorJson("/load_objects.fcgi", { object });

  if (!result.success) {
    throw new Error(result.error || "Falha ao carregar objeto");
  }

  return {
    raw: result.raw,
    data: result.data,
    rows: getRows(result.data),
  };
}

async function createObject(object: string, values: any[]) {
  const result = await connectorJson("/create_objects.fcgi", {
    object,
    values,
  });

  if (!result.success) {
    throw new Error(result.error || `Falha ao criar ${object}`);
  }

  return result.data;
}

async function destroyObject(object: string, where: any) {
  const result = await connectorJson("/destroy_objects.fcgi", {
    object,
    where,
  });

  if (!result.success) {
    throw new Error(result.error || `Falha ao apagar ${object}`);
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
    const body = (await req.json()) as Body;
    const { action, payload } = body;

    if (action === "createActiveGroup") {
      const name = normalizeName(payload?.groupName || "ALUNOS_ATIVOS");
      const groups = await loadObject("groups");
      const found = groups.rows.find((row) => normalizeName(row.name) === name);

      if (found) {
        return Response.json({
          success: true,
          groupId: Number(found.id),
          groupName: name,
          existed: true,
        });
      }

      const created = await createObject("groups", [{ name }]);

      return Response.json({
        success: true,
        groupId: Number(created.ids[0]),
        groupName: name,
        existed: false,
      });
    }

    if (action === "createBlockedGroup") {
      const name = normalizeName(payload?.groupName || "ALUNOS_BLOQUEADOS");
      const groups = await loadObject("groups");
      const found = groups.rows.find((row) => normalizeName(row.name) === name);

      if (found) {
        return Response.json({
          success: true,
          groupId: Number(found.id),
          groupName: name,
          existed: true,
        });
      }

      const created = await createObject("groups", [{ name }]);

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
      } else {
        const created = await createObject("users", [
          {
            name,
            registration,
            password: "",
          },
        ]);
        userId = Number(created.ids[0]);
      }

      const imageResult = await connectorImage(userId, photoBase64);

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

      await createObject("user_groups", [
        {
          user_id: userId,
          group_id: activeGroupId,
        },
      ]);

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

      await createObject("user_groups", [
        {
          user_id: userId,
          group_id: targetGroupId,
        },
      ]);

      return Response.json({
        success: true,
        userId,
        currentGroupId: targetGroupId,
        currentGroupName: targetGroupName,
      });
    }

    if (action === "readAccess") {
      const userId = Number(payload?.userId);

      if (!userId) {
        return Response.json({ success: false, error: "userId obrigatório" }, { status: 400 });
      }

      const logs = await loadObject("access_logs");
      const userLogs = sortByTimeAsc(
        logs.rows.filter((row) => Number(row.user_id) === userId)
      );

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
    return Response.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}