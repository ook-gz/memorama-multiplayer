import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * garda la info del jugaor
 * @param {Object} data { nombre, sucursal, telefono }
 * @returns jugador
 */
export async function guardarJugador({ nombre, sucursal, email }) {
  return prisma.jugador.upsert({
    where: { email }, // usamos teléfono como identificador único
    update: {}, // si ya existe no lo sobreescribe
    create: { nombre, sucursal, email }
  });
}

/**
 * Guarda la participacion
 * @param {Number} jugadorId id del jugador
 * @param {String} tiempo tiempo de finalización
 * @param {String} sessionId id de la sesión de juego
 */
export async function guardarParticipacion(jugadorId, tiempo, sessionId) {
  return prisma.participacion.create({
    data: {
      tiempo: String(tiempo),
      fecha: new Date().toISOString().slice(0, 19).replace("T", " "),
      sessionId,
      jugadorId
    }
  });
}

/**
 * Obtener todas las participaciones de un jugador
 * @param {Number} jugadorId
 */
export async function obtenerParticipacionesPorJugador(jugadorId) {
  return prisma.participacion.findMany({
    where: { jugadorId },
    orderBy: { fecha: "desc" }
  });
}

/**
 * Obtener todos los jugadores con sus participaciones
 */
export async function obtenerJugadoresConParticipaciones() {
  return prisma.jugador.findMany({
    include: { participaciones: true }
  });
}

/**
 * Cerrar conexión de Prisma (opcional en shutdown del server)
 */
export async function cerrarConexion() {
  await prisma.$disconnect();
}
