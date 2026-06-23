import type { Metadata } from "next";
import { GestorIdentidad } from "@/features/identidad-visual/componentes/gestor-identidad";

export const metadata: Metadata = {
  title: "Identidad Visual | Panel de Configuración",
};

export default function PaginaIdentidadVisual(): React.JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Identidad Visual</h1>
        <p className="text-sm text-gray-500">
          Personaliza los logotipos, lemas y el esquema de colores de la presencia digital de tu institución educativa.
        </p>
      </div>
      <GestorIdentidad />
    </div>
  );
}
