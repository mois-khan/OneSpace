import { Zone, Seat } from "@/types";
import { ComponentType } from "@/components/floor-map/DesignerSidebar";

function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
}

export function buildDesignerComponent(
  type: ComponentType,
  branchId: string,
  centerX: number,
  centerY: number,
  existingSeatsCount: number
): { zone: Zone; seats: Seat[] } {
  const zId = generateId("z");
  let zone: Zone;
  let seats: Seat[] = [];
  
  const SEAT_SIZE = 24;
  const GAP = 12;

  switch (type) {
    case "open_desk": {
      zone = {
        id: zId,
        branchId,
        name: "Open Desk",
        type: "hot_desk",
        x: centerX - 20,
        y: centerY - 20,
        width: 40,
        height: 40,
        color: "#F0FDF4",
        borderColor: "#BBF7D0",
        label: "Open Desk",
        capacity: 1,
      };
      seats.push({
        id: `s-${existingSeatsCount + 1}`,
        zoneId: zId,
        code: `D-${existingSeatsCount + 1}`,
        x: 8,
        y: 8,
        width: SEAT_SIZE,
        height: SEAT_SIZE,
        shape: "rect",
        status: "available",
      });
      break;
    }
    case "manager_cabin": {
      zone = {
        id: zId,
        branchId,
        name: "Manager Cabin",
        type: "manager",
        x: centerX - 30,
        y: centerY - 30,
        width: 60,
        height: 60,
        color: "#FEF2F2",
        borderColor: "#FECACA",
        label: "Manager",
        capacity: 1,
      };
      seats.push({
        id: `s-${existingSeatsCount + 1}`,
        zoneId: zId,
        code: `M-${existingSeatsCount + 1}`,
        x: 18,
        y: 18,
        width: SEAT_SIZE,
        height: SEAT_SIZE,
        shape: "rect",
        status: "available",
      });
      break;
    }
    case "cabin_3": {
      zone = {
        id: zId, branchId, name: "3-Seater Cabin", type: "cabin",
        x: centerX - 50, y: centerY - 40, width: 100, height: 80,
        color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin (3p)", capacity: 3,
      };
      for (let i = 0; i < 3; i++) {
        seats.push({
          id: `s-${existingSeatsCount + i + 1}`,
          zoneId: zId,
          code: `C-${existingSeatsCount + i + 1}`,
          x: 15 + (i * (SEAT_SIZE + GAP)),
          y: 28,
          width: SEAT_SIZE,
          height: SEAT_SIZE,
          shape: "rect",
          status: "available",
        });
      }
      break;
    }
    case "cabin_6": {
      zone = {
        id: zId, branchId, name: "6-Seater Cabin", type: "cabin",
        x: centerX - 60, y: centerY - 60, width: 120, height: 120,
        color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin (6p)", capacity: 6,
      };
      for (let i = 0; i < 6; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        seats.push({
          id: `s-${existingSeatsCount + i + 1}`,
          zoneId: zId,
          code: `C-${existingSeatsCount + i + 1}`,
          x: 15 + (col * (SEAT_SIZE + GAP)),
          y: 25 + (row * (SEAT_SIZE + GAP + 10)),
          width: SEAT_SIZE,
          height: SEAT_SIZE,
          shape: "rect",
          status: "available",
        });
      }
      break;
    }
    case "cabin_8": {
      zone = {
        id: zId, branchId, name: "8-Seater Cabin", type: "cabin",
        x: centerX - 70, y: centerY - 60, width: 140, height: 120,
        color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin (8p)", capacity: 8,
      };
      for (let i = 0; i < 8; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        seats.push({
          id: `s-${existingSeatsCount + i + 1}`,
          zoneId: zId,
          code: `C-${existingSeatsCount + i + 1}`,
          x: 10 + (col * (SEAT_SIZE + 6)),
          y: 25 + (row * (SEAT_SIZE + GAP + 10)),
          width: SEAT_SIZE,
          height: SEAT_SIZE,
          shape: "rect",
          status: "available",
        });
      }
      break;
    }
    case "cabin_10": {
      zone = {
        id: zId, branchId, name: "10-Seater Cabin", type: "cabin",
        x: centerX - 80, y: centerY - 60, width: 160, height: 120,
        color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin (10p)", capacity: 10,
      };
      for (let i = 0; i < 10; i++) {
        const row = Math.floor(i / 5);
        const col = i % 5;
        seats.push({
          id: `s-${existingSeatsCount + i + 1}`,
          zoneId: zId,
          code: `C-${existingSeatsCount + i + 1}`,
          x: 8 + (col * (SEAT_SIZE + 5)),
          y: 25 + (row * (SEAT_SIZE + GAP + 10)),
          width: SEAT_SIZE,
          height: SEAT_SIZE,
          shape: "rect",
          status: "available",
        });
      }
      break;
    }
    case "business_suite_13": {
      zone = {
        id: zId, branchId, name: "Business Suite", type: "cabin",
        x: centerX - 120, y: centerY - 80, width: 240, height: 160,
        color: "#FAF5FF", borderColor: "#E9D5FF", label: "Business Suite (12+1)", capacity: 13,
      };
      
      // 12 employee seats on the left side
      for (let i = 0; i < 12; i++) {
        const row = Math.floor(i / 4);
        const col = i % 4;
        seats.push({
          id: `s-${existingSeatsCount + i + 1}`,
          zoneId: zId,
          code: `BS-${existingSeatsCount + i + 1}`,
          x: 10 + (col * (SEAT_SIZE + 8)),
          y: 20 + (row * (SEAT_SIZE + 15)),
          width: SEAT_SIZE,
          height: SEAT_SIZE,
          shape: "rect",
          status: "available",
        });
      }
      
      // 1 Manager seat on the right side
      seats.push({
        id: `s-${existingSeatsCount + 13}`,
        zoneId: zId,
        code: `BM-${existingSeatsCount + 13}`,
        x: 180,
        y: 60,
        width: 30, // slightly larger for manager
        height: 30,
        shape: "rect",
        status: "available",
      });
      break;
    }
  }
  
  return { zone, seats };
}
