"use client";

import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Building, 
  Palette, 
  UploadCloud, 
  Globe, 
  CheckCircle2, 
  Eye, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Save, 
  Loader2, 
  AlertTriangle,
  Copy,
  Trash2,
  Lock
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  obtenerBorrador, 
  guardarBorrador, 
  cargarActivo, 
  archivarActivo, 
  obtenerPuntosAcceso, 
  crearPuntoAcceso, 
  suspenderPuntoAcceso,
  publicarIdentidad,
} from "../servicios/identidad";
import type { VersionVisual, PuntoAcceso } from "../servicios/identidad";
import { calcularContraste } from "../utilidades/contraste";

export function GestorIdentidad(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [tabActiva, setTabActiva] = React.useState<"marca" | "colores" | "activos" | "puntos" | "publicar">("marca");
  const [previewDevice, setPreviewDevice] = React.useState<"desktop" | "tablet" | "mobile">("desktop");
  const [colorTemp, setColorTemp] = React.useState<Record<string, string>>({});
  
  // Consultas
  const borradorQuery = useQuery({
    queryKey: ["identidad-borrador"],
    queryFn: obtenerBorrador,
  });

  const puntosQuery = useQuery({
    queryKey: ["puntos-acceso"],
    queryFn: obtenerPuntosAcceso,
  });

  // Mutaciones
  const guardarMutacion = useMutation({
    mutationFn: guardarBorrador,
    onSuccess: (data) => {
      queryClient.setQueryData(["identidad-borrador"], data);
      toast.success("Borrador guardado correctamente");
    },
    onError: () => {
      toast.error("Error al guardar el borrador");
    }
  });

  const publicarMutacion = useMutation({
    mutationFn: publicarIdentidad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identidad-borrador"] });
      toast.success("¡Identidad visual publicada con éxito!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al publicar la identidad visual");
    }
  });

  const subirActivoMutacion = useMutation({
    mutationFn: ({ tipo, archivo, alt }: { tipo: string; archivo: File; alt: string }) => 
      cargarActivo(tipo, archivo, alt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identidad-borrador"] });
      toast.success("Archivo subido con éxito");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al subir archivo");
    }
  });

  const archivarActivoMutacion = useMutation({
    mutationFn: archivarActivo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identidad-borrador"] });
      toast.success("Archivo archivado");
    }
  });

  const crearPuntoMutacion = useMutation({
    mutationFn: crearPuntoAcceso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puntos-acceso"] });
      toast.success("Punto de acceso creado");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al crear punto de acceso");
    }
  });

  const suspenderPuntoMutacion = useMutation({
    mutationFn: suspenderPuntoAcceso,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["puntos-acceso"] });
      toast.success("Punto de acceso suspendido");
    }
  });

  // Estado del formulario
  const [formMarca, setFormMarca] = React.useState({
    nombreMarca: "",
    nombreCortoVisual: "",
    lema: "",
    tituloLogin: "",
    mensajeLogin: "",
    textoPieLogin: "",
  });

  const [formPunto, setFormPunto] = React.useState<{
    tipo: "SUBDOMINIO_EDURA" | "RUTA_SLUG" | "CODIGO_ACCESO" | "DOMINIO_PERSONALIZADO";
    valor: string;
    esPrincipal: boolean;
  }>({
    tipo: "RUTA_SLUG",
    valor: "",
    esPrincipal: false,
  });

  // Inicializar formularios con datos del borrador
  React.useEffect(() => {
    if (borradorQuery.data) {
      setFormMarca({
        nombreMarca: borradorQuery.data.nombreMarca || "",
        nombreCortoVisual: borradorQuery.data.nombreCortoVisual || "",
        lema: borradorQuery.data.lema || "",
        tituloLogin: borradorQuery.data.tituloLogin || "",
        mensajeLogin: borradorQuery.data.mensajeLogin || "",
        textoPieLogin: borradorQuery.data.textoPieLogin || "",
      });
      
      setColorTemp({
        colorPrimario: borradorQuery.data.colorPrimario,
        colorSobrePrimario: borradorQuery.data.colorSobrePrimario,
        colorSecundario: borradorQuery.data.colorSecundario,
        colorAcento: borradorQuery.data.colorAcento,
        colorFondo: borradorQuery.data.colorFondo,
        colorSuperficie: borradorQuery.data.colorSuperficie,
        colorTextoPrincipal: borradorQuery.data.colorTextoPrincipal,
        colorTextoSecundario: borradorQuery.data.colorTextoSecundario,
      });
    }
  }, [borradorQuery.data]);

  if (borradorQuery.isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const borrador = borradorQuery.data;
  if (!borrador) return <div>No se pudo cargar el borrador de identidad.</div>;

  // Cálculos de contraste WCAG AA
  const contrastePrimario = calcularContraste(colorTemp.colorPrimario || "#FFFFFF", colorTemp.colorSobrePrimario || "#000000");
  const contrasteTextoSuperficie = calcularContraste(colorTemp.colorSuperficie || "#FFFFFF", colorTemp.colorTextoPrincipal || "#000000");
  const contrasteSecundarioSuperficie = calcularContraste(colorTemp.colorSuperficie || "#FFFFFF", colorTemp.colorTextoSecundario || "#000000");

  const passesAllContrast = contrastePrimario.passAA && contrasteTextoSuperficie.passAA;

  const handleSaveMarca = () => {
    guardarMutacion.mutate({
      ...borrador,
      ...formMarca,
    });
  };

  const handleSaveColors = () => {
    guardarMutacion.mutate({
      ...borrador,
      ...colorTemp,
    } as unknown as VersionVisual);
  };

  const handleUploadFile = (tipo: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      subirActivoMutacion.mutate({ tipo, archivo: file, alt: `Imagen ${tipo} para ${formMarca.nombreMarca}` });
    }
  };

  const handleCrearPunto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPunto.valor) return;
    crearPuntoMutacion.mutate({
      tipo: formPunto.tipo,
      valor: formPunto.valor,
      esPrincipal: formPunto.esPrincipal,
    });
    setFormPunto({ ...formPunto, valor: "" });
  };

  // Logos urls
  const logoPrincipal = borrador.activos.find((a) => a.tipo === "LOGO_PRINCIPAL" && a.estado === "ACTIVO");
  const favicon = borrador.activos.find((a) => a.tipo === "FAVICON" && a.estado === "ACTIVO");
  const fondoLogin = borrador.activos.find((a) => a.tipo === "FONDO_LOGIN" && a.estado === "ACTIVO");

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      
      {/* ── Left Administration Form ── */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-lg bg-[rgba(0,0,0,0.05)] p-1">
          <button
            onClick={() => setTabActiva("marca")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              tabActiva === "marca" ? "bg-white shadow text-primary" : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Building className="h-4 w-4" /> Marca
          </button>
          <button
            onClick={() => setTabActiva("colores")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              tabActiva === "colores" ? "bg-white shadow text-primary" : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Palette className="h-4 w-4" /> Colores
          </button>
          <button
            onClick={() => setTabActiva("activos")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              tabActiva === "activos" ? "bg-white shadow text-primary" : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <UploadCloud className="h-4 w-4" /> Logos y Fondos
          </button>
          <button
            onClick={() => setTabActiva("puntos")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              tabActiva === "puntos" ? "bg-white shadow text-primary" : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <Globe className="h-4 w-4" /> Puntos Acceso
          </button>
          <button
            onClick={() => setTabActiva("publicar")}
            className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${
              tabActiva === "publicar" ? "bg-white shadow text-primary" : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" /> Publicar
          </button>
        </div>

        {/* Tab 1: Marca */}
        {tabActiva === "marca" && (
          <Card>
            <CardHeader>
              <CardTitle>Información de Marca</CardTitle>
              <CardDescription>Configura los textos y la presencia de marca de tu portal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nombreMarca">Nombre de Marca</Label>
                  <Input 
                    id="nombreMarca" 
                    value={formMarca.nombreMarca}
                    onChange={(e) => setFormMarca({ ...formMarca, nombreMarca: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nombreCortoVisual">Nombre Corto</Label>
                  <Input 
                    id="nombreCortoVisual" 
                    value={formMarca.nombreCortoVisual}
                    onChange={(e) => setFormMarca({ ...formMarca, nombreCortoVisual: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lema">Lema o Eslogan</Label>
                <Input 
                  id="lema" 
                  value={formMarca.lema}
                  onChange={(e) => setFormMarca({ ...formMarca, lema: e.target.value })}
                />
              </div>
              <Separator />
              <div className="space-y-1.5">
                <Label htmlFor="tituloLogin">Título de Formulario de Login</Label>
                <Input 
                  id="tituloLogin" 
                  value={formMarca.tituloLogin}
                  onChange={(e) => setFormMarca({ ...formMarca, tituloLogin: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mensajeLogin">Mensaje de Bienvenida Login</Label>
                <Input 
                  id="mensajeLogin" 
                  value={formMarca.mensajeLogin}
                  onChange={(e) => setFormMarca({ ...formMarca, mensajeLogin: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="textoPieLogin">Texto del Pie del Formulario</Label>
                <Input 
                  id="textoPieLogin" 
                  value={formMarca.textoPieLogin}
                  onChange={(e) => setFormMarca({ ...formMarca, textoPieLogin: e.target.value })}
                />
              </div>
              <Button onClick={handleSaveMarca} disabled={guardarMutacion.isPending} className="w-full">
                {guardarMutacion.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Cambios de Marca
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tab 2: Colores */}
        {tabActiva === "colores" && (
          <Card>
            <CardHeader>
              <CardTitle>Colores del Portal</CardTitle>
              <CardDescription>Personaliza los colores institucionales y valida el contraste.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Color Grid Selector */}
              <div className="grid grid-cols-2 gap-6">
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Colores de Marca</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs mb-1 block">Color Primario</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-0 border" value={colorTemp.colorPrimario || "#1E3A8A"} onChange={(e) => setColorTemp({ ...colorTemp, colorPrimario: e.target.value })} />
                        <Input value={colorTemp.colorPrimario || ""} onChange={(e) => setColorTemp({ ...colorTemp, colorPrimario: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Texto sobre Primario</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-0 border" value={colorTemp.colorSobrePrimario || "#FFFFFF"} onChange={(e) => setColorTemp({ ...colorTemp, colorSobrePrimario: e.target.value })} />
                        <Input value={colorTemp.colorSobrePrimario || ""} onChange={(e) => setColorTemp({ ...colorTemp, colorSobrePrimario: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Color Secundario</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-0 border" value={colorTemp.colorSecundario || "#D8A72D"} onChange={(e) => setColorTemp({ ...colorTemp, colorSecundario: e.target.value })} />
                        <Input value={colorTemp.colorSecundario || ""} onChange={(e) => setColorTemp({ ...colorTemp, colorSecundario: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Fondo y Textos</h3>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs mb-1 block">Color Superficie</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-0 border" value={colorTemp.colorSuperficie || "#FFFFFF"} onChange={(e) => setColorTemp({ ...colorTemp, colorSuperficie: e.target.value })} />
                        <Input value={colorTemp.colorSuperficie || ""} onChange={(e) => setColorTemp({ ...colorTemp, colorSuperficie: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Texto Principal</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-0 border" value={colorTemp.colorTextoPrincipal || "#172033"} onChange={(e) => setColorTemp({ ...colorTemp, colorTextoPrincipal: e.target.value })} />
                        <Input value={colorTemp.colorTextoPrincipal || ""} onChange={(e) => setColorTemp({ ...colorTemp, colorTextoPrincipal: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs mb-1 block">Texto Secundario</Label>
                      <div className="flex gap-2">
                        <Input type="color" className="w-12 h-10 p-0 border" value={colorTemp.colorTextoSecundario || "#536078"} onChange={(e) => setColorTemp({ ...colorTemp, colorTextoSecundario: e.target.value })} />
                        <Input value={colorTemp.colorTextoSecundario || ""} onChange={(e) => setColorTemp({ ...colorTemp, colorTextoSecundario: e.target.value })} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Contrast Checker Section */}
              <div className="rounded-lg border p-4 bg-gray-50 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-1.5 text-gray-800">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Validación de Contraste (WCAG AA)
                </h4>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span>Botones: Texto sobre Primario ({colorTemp.colorSobrePrimario} vs {colorTemp.colorPrimario})</span>
                    <Badge variant={contrastePrimario.passAA ? "default" : "destructive"}>
                      {contrastePrimario.ratio}:1 - {contrastePrimario.passAA ? "PASA (AA)" : "FALLA"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center border-b pb-1.5">
                    <span>Texto Principal sobre Superficie ({colorTemp.colorTextoPrincipal} vs {colorTemp.colorSuperficie})</span>
                    <Badge variant={contrasteTextoSuperficie.passAA ? "default" : "destructive"}>
                      {contrasteTextoSuperficie.ratio}:1 - {contrasteTextoSuperficie.passAA ? "PASA (AA)" : "FALLA"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Texto Secundario sobre Superficie ({colorTemp.colorTextoSecundario} vs {colorTemp.colorSuperficie})</span>
                    <Badge variant={contrasteSecundarioSuperficie.passAALarge ? "default" : "destructive"}>
                      {contrasteSecundarioSuperficie.ratio}:1 - {contrasteSecundarioSuperficie.passAALarge ? "PASA (AA Grande)" : "FALLA"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveColors} disabled={guardarMutacion.isPending} className="w-full">
                {guardarMutacion.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Guardar Cambios de Colores
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tab 3: Activos */}
        {tabActiva === "activos" && (
          <Card>
            <CardHeader>
              <CardTitle>Logotipos y Fondos</CardTitle>
              <CardDescription>Carga los archivos visuales de tu colegio.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                
                {/* Logo Principal Upload */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm">Logotipo Principal</h4>
                      <p className="text-xs text-gray-500">Tamaño máximo: 2 MB (PNG, JPEG, WebP)</p>
                    </div>
                    {logoPrincipal ? (
                      <Button variant="ghost" size="icon" onClick={() => archivarActivoMutacion.mutate(logoPrincipal.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : null}
                  </div>
                  {logoPrincipal ? (
                    <div className="flex h-20 w-40 items-center justify-center border rounded bg-white p-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/v1/publico/activos/${logoPrincipal.claveAlmacenamiento}`} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer">
                      <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">Seleccionar o soltar logotipo</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadFile("LOGO_PRINCIPAL", e)} />
                    </div>
                  )}
                </div>

                {/* Favicon Upload */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm">Favicon (Icono de pestaña)</h4>
                      <p className="text-xs text-gray-500">Tamaño máximo: 512 KB (PNG, ICO)</p>
                    </div>
                    {favicon ? (
                      <Button variant="ghost" size="icon" onClick={() => archivarActivoMutacion.mutate(favicon.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : null}
                  </div>
                  {favicon ? (
                    <div className="flex h-12 w-12 items-center justify-center border rounded bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/v1/publico/activos/${favicon.claveAlmacenamiento}`} alt="Favicon" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer">
                      <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600 font-medium">Cargar favicon</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadFile("FAVICON", e)} />
                    </div>
                  )}
                </div>

                {/* Fondo Login Upload */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-sm">Fondo de Pantalla de Login (Opcional)</h4>
                      <p className="text-xs text-gray-500">Tamaño máximo: 5 MB (JPEG, PNG, WebP)</p>
                    </div>
                    {fondoLogin ? (
                      <Button variant="ghost" size="icon" onClick={() => archivarActivoMutacion.mutate(fondoLogin.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    ) : null}
                  </div>
                  {fondoLogin ? (
                    <div className="flex h-24 w-full items-center justify-center border rounded overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/api/v1/publico/activos/${fondoLogin.claveAlmacenamiento}`} alt="Fondo" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 cursor-pointer">
                      <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-600 font-medium">Seleccionar imagen de fondo</span>
                      <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleUploadFile("FONDO_LOGIN", e)} />
                    </div>
                  )}
                </div>

              </div>

            </CardContent>
          </Card>
        )}

        {/* Tab 4: Puntos de Acceso */}
        {tabActiva === "puntos" && (
          <Card>
            <CardHeader>
              <CardTitle>Puntos de Acceso</CardTitle>
              <CardDescription>Configura los subdominios y rutas slugs para el acceso al portal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Form Crear Punto */}
              <form onSubmit={handleCrearPunto} className="space-y-4 rounded-lg border p-4 bg-gray-50">
                <h4 className="font-semibold text-sm">Registrar Nuevo Punto de Acceso</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="tipoPunto">Tipo de Acceso</Label>
                    <select
                      id="tipoPunto"
                      value={formPunto.tipo}
                      onChange={(e) => setFormPunto({ ...formPunto, tipo: e.target.value as "SUBDOMINIO_EDURA" | "RUTA_SLUG" | "CODIGO_ACCESO" | "DOMINIO_PERSONALIZADO" })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="RUTA_SLUG">Ruta Slug (ej: acceso/slug)</option>
                      <option value="SUBDOMINIO_EDURA">Subdominio (ej: slug.edura.pe)</option>
                      <option value="DOMINIO_PERSONALIZADO">Dominio Personalizado (Requiere verificación)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="valorPunto">Valor del Identificador</Label>
                    <Input
                      id="valorPunto"
                      value={formPunto.valor}
                      placeholder={formPunto.tipo === 'RUTA_SLUG' ? 'san-martin' : 'colegiosanmartin.pe'}
                      onChange={(e) => setFormPunto({ ...formPunto, valor: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="esPrincipal"
                    checked={formPunto.esPrincipal}
                    onChange={(e) => setFormPunto({ ...formPunto, esPrincipal: e.target.checked })}
                  />
                  <Label htmlFor="esPrincipal" className="text-xs">Establecer como punto de acceso principal</Label>
                </div>

                <Button type="submit" disabled={crearPuntoMutacion.isPending}>
                  {crearPuntoMutacion.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Agregar Acceso
                </Button>
              </form>

              {/* List Puntos Acceso */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Puntos de Acceso Configurados</h4>
                <div className="space-y-2">
                  {puntosQuery.data?.map((p: PuntoAcceso) => (
                    <div key={p.id} className="flex justify-between items-center border rounded-lg p-3 hover:bg-gray-50 transition">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{p.valor}</span>
                          {p.esPrincipal && <Badge>Principal</Badge>}
                          <Badge variant={p.estado === 'ACTIVO' ? 'default' : 'secondary'}>{p.estado}</Badge>
                        </div>
                        <span className="text-xs text-gray-500">{p.tipo}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            navigator.clipboard.writeText(p.valor);
                            toast.success("Enlace copiado");
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {p.estado === 'ACTIVO' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => suspenderPuntoMutacion.mutate(p.id)}
                          >
                            Suspender
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        {/* Tab 5: Publicar */}
        {tabActiva === "publicar" && (
          <Card>
            <CardHeader>
              <CardTitle>Publicar Cambios de Identidad Visual</CardTitle>
              <CardDescription>Publica tu borrador actual para que sea visible por tus usuarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="rounded-lg border p-4 bg-amber-50 border-amber-200 text-amber-800 space-y-2">
                <h4 className="font-semibold flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600" />
                  Antes de publicar, ten en cuenta:
                </h4>
                <ul className="list-disc list-inside text-xs space-y-1">
                  <li>Se archivará la versión publicada anterior (Versión {borrador.numeroVersion - 1}).</li>
                  <li>Los cambios afectarán el login escolar en tiempo real.</li>
                  <li>Se validará el contraste WCAG AA en colores.</li>
                </ul>
              </div>

              {/* Botón de publicación con validación */}
              <div className="space-y-3">
                {!passesAllContrast && (
                  <div className="rounded-lg bg-red-50 text-red-800 border border-red-200 p-4 text-xs flex items-start gap-2">
                    <Lock className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-1">Publicación Bloqueada</span>
                      Tu configuración de colores no cumple con los requisitos mínimos de accesibilidad (contraste &ge; 4.5:1). Por favor, ajusta tus colores de marca antes de publicar.
                    </div>
                  </div>
                )}
                
                <Button 
                  onClick={() => publicarMutacion.mutate()} 
                  disabled={publicarMutacion.isPending || !passesAllContrast} 
                  className="w-full text-lg py-6"
                >
                  {publicarMutacion.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                  Publicar Versión {borrador.numeroVersion}
                </Button>
              </div>

            </CardContent>
          </Card>
        )}

      </div>

      {/* ── Right Device Preview Panel ── */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Device Controls */}
        <div className="flex justify-between items-center bg-gray-100 p-2 rounded-lg">
          <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
            <Eye className="h-4 w-4" /> Vista Previa Real (Borrador)
          </span>
          <div className="flex gap-1">
            <Button variant={previewDevice === "desktop" ? "default" : "ghost"} size="icon" onClick={() => setPreviewDevice("desktop")}>
              <Laptop className="h-4 w-4" />
            </Button>
            <Button variant={previewDevice === "tablet" ? "default" : "ghost"} size="icon" onClick={() => setPreviewDevice("tablet")}>
              <Tablet className="h-4 w-4" />
            </Button>
            <Button variant={previewDevice === "mobile" ? "default" : "ghost"} size="icon" onClick={() => setPreviewDevice("mobile")}>
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Device Frame */}
        <div className="flex justify-center bg-gray-200 rounded-xl p-4 overflow-hidden min-h-[500px]">
          <div 
            className="transition-all duration-300 overflow-hidden shadow-2xl rounded-lg bg-gray-50 border relative"
            style={{
              width: previewDevice === "desktop" ? "100%" : previewDevice === "tablet" ? "450px" : "320px",
              height: "500px",
              fontSize: "14px"
            }}
          >
            {/* Live mockup content */}
            <div className="h-full flex flex-col justify-between" style={{ backgroundColor: colorTemp.colorFondo || "#F8FAFC" }}>
              
              {/* Fake Topbar */}
              <div className="flex justify-between items-center px-4 py-2 border-b bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  {favicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/v1/publico/activos/${favicon.claveAlmacenamiento}`} alt="Favicon" className="h-4 w-4" />
                  ) : (
                    <Building className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="text-xs font-semibold text-gray-800">{formMarca.nombreCortoVisual || formMarca.nombreMarca || "EDURA"}</span>
                </div>
                <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
              </div>

              {/* Login mockup card */}
              <div className="flex-1 flex flex-col justify-center px-6">
                
                <div 
                  className="rounded-xl p-6 shadow-md border space-y-4 max-w-sm mx-auto w-full transition-colors"
                  style={{ 
                    backgroundColor: colorTemp.colorSuperficie || "#FFFFFF",
                    borderColor: "rgba(0,0,0,0.05)"
                  }}
                >
                  <div className="flex flex-col items-center">
                    {logoPrincipal ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/api/v1/publico/activos/${logoPrincipal.claveAlmacenamiento}`} alt="Logo" className="h-10 object-contain mb-2" />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200 mb-2 flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <h3 className="font-bold text-base text-center" style={{ color: colorTemp.colorTextoPrincipal || "#172033" }}>
                      {formMarca.tituloLogin || "Iniciar sesión"}
                    </h3>
                    <p className="text-xs text-center mt-1" style={{ color: colorTemp.colorTextoSecundario || "#536078" }}>
                      {formMarca.mensajeLogin || "Ingresa tus credenciales"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="h-8 rounded bg-gray-100 border border-gray-200" />
                    <div className="h-8 rounded bg-gray-100 border border-gray-200" />
                  </div>

                  <Button 
                    className="w-full text-xs font-semibold py-2 rounded-lg"
                    style={{ 
                      backgroundColor: colorTemp.colorPrimario || "#1E3A8A", 
                      color: colorTemp.colorSobrePrimario || "#FFFFFF" 
                    }}
                  >
                    Ingresar
                  </Button>
                </div>

              </div>

              {/* Fake footer */}
              <div className="px-4 py-2 border-t text-center text-[10px]" style={{ color: colorTemp.colorTextoSecundario || "#536078" }}>
                {formMarca.textoPieLogin || "Tecnología provista por EDURA"}
              </div>

            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
