# Informe de Auditoría de Base de Datos Real - EDURA

* **Fecha de Ejecución:** 2026-06-22T00:13:17.392Z
* **Migraciones Aplicadas:** 22
* **Inconsistencias Totales:** 6
* **Inconsistencias Críticas:** 2
* **Estado General:** 🔴 CRÍTICO / INCONSISTENTE

## Conteo de Registros por Tabla

| Tabla | Registros |
| --- | --- |
| instituciones_educativas | 116 |
| sedes | 93 |
| predios | 0 |
| edificaciones | 0 |
| niveles | 0 |
| espacios_fisicos | 0 |
| espacios_exteriores | 0 |
| componentes_infraestructura | 0 |
| elementos_infraestructura | 19 |
| evaluaciones_conservacion_elemento | 0 |
| usuarios | 147 |
| credenciales_usuario | 124 |
| membresias_institucion | 124 |
| roles | 6 |
| permisos | 61 |
| roles_permisos | 157 |
| asignaciones_rol_usuario | 140 |
| invitaciones_acceso | 0 |
| sesiones_usuario | 139 |
| tokens_seguridad_usuario | 0 |
| eventos_auditoria | 1433 |
| personas | 66 |
| documentos_identidad_persona | 1 |
| medios_contacto_persona | 1 |
| direcciones_persona | 1 |
| estudiantes | 2 |
| apoderados_estudiante | 1 |
| documentos_estudiante | 0 |
| docentes | 1 |
| asignaciones_docente_sede | 1 |
| especialidades_profesionales | 0 |
| docentes_especialidades_profesionales | 0 |
| anios_academicos | 1 |
| periodos_academicos | 1 |
| ofertas_grado_sede | 1 |
| secciones_academicas | 2 |
| areas_curriculares | 1 |
| asignaturas | 1 |
| planes_estudio | 1 |
| detalles_plan_estudio | 1 |
| matriculas | 2 |
| historial_estados_matricula | 6 |
| historial_cambios_seccion_matricula | 2 |
| comunicados_institucionales | 10 |
| alertas_institucionales | 107 |

## Detalle de Inconsistencias Encontradas

### [CRÍTICO] USUARIO_SIN_CREDENCIAL
* **Descripción:** Usuarios sin credencial registrada
* **Detalles:**
```json
[
  {
    "id": "6765de2f-330f-46bb-be7b-71a1496c6793",
    "correo": "panel-A-34c91cc6@test.edura.local"
  },
  {
    "id": "a76f1e74-4b32-4cdd-9b9d-5d00d6cb3522",
    "correo": "panel-A-ad82384c@test.edura.local"
  },
  {
    "id": "08682012-4e19-4e25-ab3c-623292ea9390",
    "correo": "panel-A-31d04a04@test.edura.local"
  },
  {
    "id": "02ff8549-e8fa-446e-8dba-0cbdbc8ad703",
    "correo": "panel-A-c8c95c39@test.edura.local"
  },
  {
    "id": "e1de09a9-d303-41db-9c36-893428e6c0d9",
    "correo": "panel-A-6f525993@test.edura.local"
  },
  {
    "id": "930352eb-6454-45e4-a961-d654a1c84985",
    "correo": "panel-A-4f348617@test.edura.local"
  },
  {
    "id": "d73864d3-7d2f-4754-bcb8-22bbdd0e5fbf",
    "correo": "panel-A-31b185fc@test.edura.local"
  },
  {
    "id": "916a0000-109e-4d86-9cf3-fe060af573af",
    "correo": "panel-A-a1210e4b@test.edura.local"
  },
  {
    "id": "669f6f60-41e1-4fde-ac09-5fa275ec77df",
    "correo": "panel-A-bb8a592d@test.edura.local"
  },
  {
    "id": "14d911a5-df93-4c4b-8bd5-d2c89a0817db",
    "correo": "panel-A-9949ac60@test.edura.local"
  },
  {
    "id": "51e14e01-49d7-431f-b03f-b56d992f5f47",
    "correo": "panel-A-d84abf46@test.edura.local"
  },
  {
    "id": "58f9e12b-8d13-40fa-b3b6-8b9298889f27",
    "correo": "panel-A-8f51376f@test.edura.local"
  },
  {
    "id": "de068488-e193-4c87-90f6-0c6bc5c04197",
    "correo": "panel-A-eb88e924@test.edura.local"
  },
  {
    "id": "ed197deb-4a42-42f2-95e9-029ef3b2f09f",
    "correo": "panel-A-0f9f8747@test.edura.local"
  },
  {
    "id": "492cea01-72b4-4b2c-8da3-2a9e450d30c6",
    "correo": "panel-A-e04e66e2@test.edura.local"
  },
  {
    "id": "4fc9cd9d-94bc-49e4-982c-ca7fbfd0769d",
    "correo": "panel-A-933baf55@test.edura.local"
  },
  {
    "id": "b271d243-9bf5-44c2-8ec9-fc617de2bd81",
    "correo": "panel-A-4346c4b6@test.edura.local"
  },
  {
    "id": "ef4e56b7-ef07-49f5-90ac-4547a84c8f9a",
    "correo": "panel-A-8b163075@test.edura.local"
  },
  {
    "id": "27bca0c9-982b-4ec5-a1d6-b26c72beab16",
    "correo": "panel-A-fbdfe448@test.edura.local"
  },
  {
    "id": "ccfc6f9d-d5fa-40ac-a0d8-5e895d48167f",
    "correo": "panel-A-3d36dbae@test.edura.local"
  },
  {
    "id": "d2e1865a-e3f9-44e3-9acc-0ed0f9ecb535",
    "correo": "panel-A-f828b003@test.edura.local"
  },
  {
    "id": "30439ebe-1067-41c7-a9ef-826474887ede",
    "correo": "panel-A-451e5bcd@test.edura.local"
  },
  {
    "id": "c3477ac7-9321-47b4-ad02-299fde5bfbdc",
    "correo": "panel-A-7a735711@test.edura.local"
  }
]
```

### [ADVERTENCIA] MEMBRESIA_SIN_PERSONA
* **Descripción:** Membresías institucionales que no tienen persona asignada
* **Detalles:**
```json
[
  {
    "id": "adb065c6-b959-4ee8-99ed-35d25fa6cadf",
    "id_usuario": "97741b93-d079-4df7-b32a-f67bea49f5c0"
  },
  {
    "id": "adb065c6-b959-4ee8-99ed-35d25fa6cadf",
    "id_usuario": "97741b93-d079-4df7-b32a-f67bea49f5c0"
  },
  {
    "id": "adb065c6-b959-4ee8-99ed-35d25fa6cadf",
    "id_usuario": "97741b93-d079-4df7-b32a-f67bea49f5c0"
  },
  {
    "id": "ac778aa2-c588-4a4a-b798-0c693046d01d",
    "id_usuario": "8c557754-26c0-4f3e-a14f-ac45598a98b4"
  },
  {
    "id": "5e9ba121-98a2-4589-a4de-6f5fd04d3975",
    "id_usuario": "04815b60-d510-49e2-89f8-9b37c6f5a9cb"
  },
  {
    "id": "fa00876e-9161-4485-ba8e-35b29698dcaf",
    "id_usuario": "8ae64968-5126-43d1-86a0-685c55b98de2"
  },
  {
    "id": "813387f9-f7b3-4a88-8756-bf74367eb879",
    "id_usuario": "301bf1d1-f281-4193-937f-123c83881f35"
  },
  {
    "id": "591f7d1f-b789-434f-b7ae-8e40ba5cc551",
    "id_usuario": "44965ea2-e8e9-447f-8ec1-f894e022a6bf"
  },
  {
    "id": "3d76078b-8130-4e2f-9623-e4f7f0fdfcd1",
    "id_usuario": "e338a7fb-0550-4d70-9bc3-b6516881021c"
  },
  {
    "id": "fb075e43-47b4-4bc4-8907-44604bad279e",
    "id_usuario": "689488a4-05f3-4ab2-a711-ef30b137589d"
  },
  {
    "id": "65ba28c1-a238-4e34-bb3f-021f7db1b821",
    "id_usuario": "7fc5c2e6-0323-419d-81b7-d74fb1326b9f"
  },
  {
    "id": "65ba28c1-a238-4e34-bb3f-021f7db1b821",
    "id_usuario": "7fc5c2e6-0323-419d-81b7-d74fb1326b9f"
  },
  {
    "id": "82af8483-64bb-4a5b-8f66-0b08d817fb3a",
    "id_usuario": "73e91c8d-dd41-44d9-99c1-ec12599a49b8"
  },
  {
    "id": "ff21343c-02c4-4c3f-ad2f-6c6ea672692c",
    "id_usuario": "eb5cf96c-9c04-42a4-a18c-dfdfa2e6a410"
  },
  {
    "id": "9e8b1e7c-f22c-40cc-bcfd-59c49ec54faf",
    "id_usuario": "c6e2661c-26b1-475b-a28a-4a84c91fc26a"
  },
  {
    "id": "65ba28c1-a238-4e34-bb3f-021f7db1b821",
    "id_usuario": "7fc5c2e6-0323-419d-81b7-d74fb1326b9f"
  },
  {
    "id": "0985ce7f-3f5c-4bf5-8390-9adba75b453c",
    "id_usuario": "c27978a5-ff29-4c98-adf5-7445f86f42ec"
  },
  {
    "id": "19327dc3-28f1-4edd-a8df-e3ffc7a39ef5",
    "id_usuario": "6f8ecf84-1a4f-42ae-9eba-f562fb529f35"
  },
  {
    "id": "526b28f0-27b2-49df-813c-60dd15132e82",
    "id_usuario": "98372d24-fe94-431e-b208-7f598f486d85"
  },
  {
    "id": "f0f6ae1f-a9b6-4a8c-b09b-8b2e52bc4a3d",
    "id_usuario": "70ce0c51-9ae4-4916-8a1e-76dfbd821122"
  },
  {
    "id": "4d5e7355-1e87-4ee9-9214-44d99a382e5c",
    "id_usuario": "6f6fb460-8beb-455d-a358-dfda35ae265c"
  },
  {
    "id": "e76745bd-b3fe-45fb-822b-825f19e56591",
    "id_usuario": "2618746e-d61e-400b-a95b-8b4a07e83f1f"
  },
  {
    "id": "ac76d40f-471a-448a-a29a-cf48f13d60f1",
    "id_usuario": "fa2785c9-8918-472a-aded-354e2fb7bebe"
  },
  {
    "id": "22c9fb57-2f61-4ac5-ae32-9110b3e6a925",
    "id_usuario": "8ec21c9b-251c-4818-a36c-68e6a03a01be"
  },
  {
    "id": "22c9fb57-2f61-4ac5-ae32-9110b3e6a925",
    "id_usuario": "8ec21c9b-251c-4818-a36c-68e6a03a01be"
  },
  {
    "id": "22c9fb57-2f61-4ac5-ae32-9110b3e6a925",
    "id_usuario": "8ec21c9b-251c-4818-a36c-68e6a03a01be"
  },
  {
    "id": "cbe73a4c-40c1-40f8-99a3-733291072e6c",
    "id_usuario": "6d9e6a27-9ba0-43bf-8360-c7d4a2839966"
  },
  {
    "id": "03fe4c80-74cf-430d-b166-33d871fae869",
    "id_usuario": "ee0cda47-003f-43d1-8599-c299e5c03e98"
  },
  {
    "id": "9103c8de-583b-412f-ad91-ccf41c5a256d",
    "id_usuario": "c869e337-e2b5-4f68-917c-d347eea89dfb"
  },
  {
    "id": "e93f3e23-682a-459c-80c0-998dee3dc06d",
    "id_usuario": "81daa5fd-2d85-46a5-a982-e99ace426c10"
  },
  {
    "id": "e93f3e23-682a-459c-80c0-998dee3dc06d",
    "id_usuario": "81daa5fd-2d85-46a5-a982-e99ace426c10"
  },
  {
    "id": "e93f3e23-682a-459c-80c0-998dee3dc06d",
    "id_usuario": "81daa5fd-2d85-46a5-a982-e99ace426c10"
  },
  {
    "id": "49b0a0d3-6f0f-4c05-a58c-42cd942f9219",
    "id_usuario": "8893d37e-83cc-4e28-965f-579f68aeed87"
  },
  {
    "id": "084114ab-0ea6-44e5-80ca-7df00e660c00",
    "id_usuario": "f560adc9-bec3-4f8b-81bf-ab685612d704"
  },
  {
    "id": "9d919818-f87a-46e2-8914-3aca8a665484",
    "id_usuario": "32e60629-31ef-414a-965c-5a206e4c516f"
  },
  {
    "id": "80363cd6-ae05-4cd8-a81a-66bb3488f38f",
    "id_usuario": "d237b0c1-a564-4307-9471-388f9a910fea"
  },
  {
    "id": "e5eef3ef-f85e-45ad-8064-de54afb5c30e",
    "id_usuario": "d68dd816-d2b9-4885-9262-3b962b6c9f8b"
  },
  {
    "id": "e5eef3ef-f85e-45ad-8064-de54afb5c30e",
    "id_usuario": "d68dd816-d2b9-4885-9262-3b962b6c9f8b"
  },
  {
    "id": "e5eef3ef-f85e-45ad-8064-de54afb5c30e",
    "id_usuario": "d68dd816-d2b9-4885-9262-3b962b6c9f8b"
  },
  {
    "id": "f9e6be15-16da-41e3-9ecf-501165f88467",
    "id_usuario": "6c7c838d-e9d7-499d-8dd4-69d18f765b69"
  },
  {
    "id": "02cafe10-19d4-4faf-b38b-244ca3005d99",
    "id_usuario": "7102e668-c668-4ef8-a7e9-5e51ec576c32"
  },
  {
    "id": "dfc605c4-2647-43c2-8314-e9795e72688b",
    "id_usuario": "f7ff16fd-8164-4d95-affa-25ee2c9eb60a"
  },
  {
    "id": "c077feec-1d3a-440f-a2b4-bb2e7e186375",
    "id_usuario": "199c0017-5696-42b9-8f5e-382687d4d31f"
  },
  {
    "id": "f8229467-5f90-450a-8a9a-599d8c590de2",
    "id_usuario": "c0117ea7-9f69-4d4d-95a2-2bc79e8724ab"
  },
  {
    "id": "f6709dfc-7ea1-4079-934a-b0a706e082c6",
    "id_usuario": "9fff325d-e2c3-4921-84a4-5d825bbeacf7"
  },
  {
    "id": "92857aba-86f7-4a1b-a994-001ffd19d9cf",
    "id_usuario": "cde9c03a-33b0-48b6-bb6b-7bc750055eb2"
  },
  {
    "id": "97e55ad5-b7e2-4c66-9371-a3a3d58f912b",
    "id_usuario": "e3febe94-c1af-47c4-a58a-96d8a586d439"
  },
  {
    "id": "d08fc1ae-5b2a-4fdc-9466-7f8d7f1abc38",
    "id_usuario": "859a4baf-16a7-4d9d-81cc-f3e46bb1cb0f"
  },
  {
    "id": "d08fc1ae-5b2a-4fdc-9466-7f8d7f1abc38",
    "id_usuario": "859a4baf-16a7-4d9d-81cc-f3e46bb1cb0f"
  },
  {
    "id": "d08fc1ae-5b2a-4fdc-9466-7f8d7f1abc38",
    "id_usuario": "859a4baf-16a7-4d9d-81cc-f3e46bb1cb0f"
  },
  {
    "id": "5f7fa0d8-7e8e-4731-8964-978ff1737bea",
    "id_usuario": "c7207854-7b92-473c-bd40-47c3569bb497"
  },
  {
    "id": "d86ec0e3-e429-4600-92be-d9dacf2f7d28",
    "id_usuario": "75f21ae0-1794-49da-8c06-7254df58c92f"
  },
  {
    "id": "a30abc44-116b-48db-963d-58b067242f3c",
    "id_usuario": "e04854ed-d9f1-4629-b029-d3c3af97cfe5"
  },
  {
    "id": "d494d14c-719e-475d-9b37-02e25297e4a8",
    "id_usuario": "0a0ab856-8e99-462c-86c7-4217338cfdb7"
  },
  {
    "id": "bac83c8f-700e-4d1e-8650-c94045945521",
    "id_usuario": "59bbaada-8fb9-4e5d-b5f8-9a7ac907470a"
  },
  {
    "id": "1fad6b9e-af54-4117-b20d-d4af727521c9",
    "id_usuario": "a8b2258d-497e-47ec-b6ca-1bda28cca623"
  },
  {
    "id": "6756ec7f-460c-43d7-a1e0-eee79e169563",
    "id_usuario": "fe7d1783-afcc-436a-a04e-fc51dc7a6cc4"
  },
  {
    "id": "49d43fe7-cc78-4c69-90db-22b3dfc9f2b3",
    "id_usuario": "75b3499e-44a4-46c0-b232-3887d44ffbf9"
  },
  {
    "id": "a78c3612-0b50-45dd-a02f-e89b6f9ee41a",
    "id_usuario": "70c37138-883a-4c6b-ae01-fad40449ea01"
  },
  {
    "id": "d55de309-41ed-4da6-a348-1a9b81b0724e",
    "id_usuario": "1b421f24-44e6-45d8-8465-61965e80e066"
  },
  {
    "id": "a5161d9c-ca60-419e-b07f-465ea498862a",
    "id_usuario": "4d01bcf9-1799-47ae-9511-3c363835de76"
  },
  {
    "id": "48a40121-225b-41fb-b1f5-2ccefce31e99",
    "id_usuario": "025f9652-ce6a-41bc-a371-2ba836f268dc"
  },
  {
    "id": "d8c20962-cfe2-41b9-a929-aef54afb9129",
    "id_usuario": "b6258e37-d0db-4e81-bf39-2dee2cd8e822"
  },
  {
    "id": "2bbf9b0d-1e55-4c7b-8834-79d5a3956914",
    "id_usuario": "54e268ff-bc8d-4c7a-9344-a0d699206588"
  },
  {
    "id": "d13bab01-3919-4336-b5eb-1d7b08c88ff1",
    "id_usuario": "960ef141-5d29-414e-999d-dfd63550a920"
  },
  {
    "id": "a230aee8-2a82-445c-870f-dcaa852659d2",
    "id_usuario": "2dad9995-bf81-46a5-9165-162377fd212e"
  },
  {
    "id": "71b5c5b3-1aec-4e70-a0c9-75e18edbf2a4",
    "id_usuario": "7aacf524-7eb2-43d7-84b0-074edeb3fb50"
  },
  {
    "id": "20db7dfa-c4b5-4a7f-bde4-f6ab8b5166b9",
    "id_usuario": "37b3c499-bcde-4d25-a5ef-3f8298b9d6ab"
  },
  {
    "id": "4967ab0d-70cd-44f7-a03e-bd371d7298a3",
    "id_usuario": "d5c4ee4d-8de7-4cb4-93d7-497a3e5f4301"
  },
  {
    "id": "db6811c2-3ec4-4fdb-bf86-6b75a6cc0431",
    "id_usuario": "4582db6d-532d-4a1b-a126-2163c3997f51"
  },
  {
    "id": "bf0baa75-c1f7-4821-bce4-f2e11acb808a",
    "id_usuario": "221390fc-9f75-475c-8b57-1ebba0e1829b"
  },
  {
    "id": "ed0d7941-37fc-496a-80c4-a892a9afa9d9",
    "id_usuario": "83f507de-62b1-40b8-b0c7-f881295bfd5b"
  },
  {
    "id": "bb998bc5-87c2-42c4-a2ed-0e6953789ec4",
    "id_usuario": "36a794a6-cf82-450f-8ab0-42befd431aa9"
  },
  {
    "id": "fd41586c-93a7-4752-9fc5-dd1e85b734b9",
    "id_usuario": "47fdab24-5405-416b-834d-a7c375813b6b"
  },
  {
    "id": "c1fc5624-debd-4e91-b96d-51aea5f01cde",
    "id_usuario": "6908c7fd-0009-47d3-b1cb-993f075eb91e"
  },
  {
    "id": "e18bcd30-a9b9-4cfd-b1bb-399beaef9e9b",
    "id_usuario": "4e45cb2e-f006-4480-8f65-90a38191bc94"
  },
  {
    "id": "2fdf4e1e-b1bb-47b5-947d-5bb88dea0c69",
    "id_usuario": "7d4e1988-8750-4dd5-86ef-d69ea3c93ff1"
  },
  {
    "id": "4965ec28-9973-4e2c-b8eb-dc7225d9dbb5",
    "id_usuario": "103e9a1b-28f6-426e-9273-95d7d024d6ec"
  },
  {
    "id": "89bf79fd-0e0b-45c5-865f-49da5a722bbd",
    "id_usuario": "bf2c9961-f972-41cc-ad9e-939b465a3009"
  },
  {
    "id": "5a5c5c21-98c1-4ada-826c-72f0865e67a7",
    "id_usuario": "ae9e4123-a144-499f-a2d4-253a8450cd79"
  },
  {
    "id": "4a9a0e5b-555b-48f5-bc51-b5acfa76ed21",
    "id_usuario": "74f3496e-f017-403a-abe1-fba9ef2ebebd"
  },
  {
    "id": "02a49790-136a-4524-bdfc-3ff2d66e32d7",
    "id_usuario": "5418e381-23e3-4225-907a-48555cbd3668"
  },
  {
    "id": "74ee3528-1f4e-4104-987c-eb15a67195ae",
    "id_usuario": "bdd044ea-30e8-44d6-ba5c-6d76320ae3a2"
  },
  {
    "id": "12c0c2ad-3454-462f-9d90-e9da29ad0717",
    "id_usuario": "10f88836-9403-4c2c-b42e-b1383c2606ab"
  },
  {
    "id": "b9d80b01-368d-44a3-8e69-f766b5668cbd",
    "id_usuario": "9f503b07-555a-48fd-b56e-b8330a8b981a"
  },
  {
    "id": "16a0a744-ec73-47c9-95ef-3940bb8f7f9c",
    "id_usuario": "330aa466-4614-4dc7-8783-79322ce8d747"
  },
  {
    "id": "adf47515-66e3-444a-9a4a-7c3823bdf6c2",
    "id_usuario": "c537d8d2-f215-4c64-8dc3-9d8ebc492c82"
  },
  {
    "id": "4148b4e8-902c-47bf-914b-8e6a9d57b8f8",
    "id_usuario": "fbfdda64-b5db-4451-81ab-60d9bde15deb"
  },
  {
    "id": "842f8ad4-463c-4331-bcce-2c1d0664afe3",
    "id_usuario": "1734aee4-1b8c-46d1-8789-44985b131f48"
  },
  {
    "id": "51520c89-c8d5-49b6-9519-f790f5647ad5",
    "id_usuario": "a54a7f99-26ef-4c40-afd6-2c8e7f6affef"
  },
  {
    "id": "dea4dce2-8e32-40f5-a56c-3e3fd9dac0fa",
    "id_usuario": "bde2ed55-3d77-408a-a01b-d1c24270fc5a"
  },
  {
    "id": "57f2b0d5-c139-469d-a68e-be3d2069a99c",
    "id_usuario": "04bc81cd-f4e6-41f7-9047-6106843e2743"
  },
  {
    "id": "b00cea5c-3005-42cd-ae24-84c4f0757b07",
    "id_usuario": "8fdbbb66-607a-4a73-b707-dcc03d3a355d"
  },
  {
    "id": "13a8d47d-644b-48d2-b4b4-05240ba19f07",
    "id_usuario": "7ef1d3a3-29e5-48c2-af70-3989466ff550"
  },
  {
    "id": "ddb507f8-8214-49d7-ab5f-121eab25f6e9",
    "id_usuario": "93045bee-7709-43e5-b19b-1afa401f1bc5"
  },
  {
    "id": "d6c90fc5-e48a-4e8a-9220-9236e170310a",
    "id_usuario": "fc92f096-1b79-4439-9a8c-221a26802e13"
  },
  {
    "id": "9fc22742-5f35-42c9-bc94-d2c78534f38a",
    "id_usuario": "8b8a8bb6-d0c2-469c-a86c-5d55ef3519fe"
  },
  {
    "id": "b8f2f18c-0c7d-4f41-a877-4185fc659707",
    "id_usuario": "0ac8fe03-b3b0-496c-8911-e4faf2062d02"
  },
  {
    "id": "798cac0c-ebe2-4b70-8601-c3dd9e58f56b",
    "id_usuario": "5cc88c1c-e2e6-4aac-b658-afcc9dda96c2"
  },
  {
    "id": "c366a50b-42d9-4e97-832e-53d29ae8ad49",
    "id_usuario": "57b377f3-ea1d-4d78-9456-d814222467c6"
  },
  {
    "id": "4a70bd32-62f7-4927-84bb-f602e7a2c777",
    "id_usuario": "6cb97d26-a920-4b85-a1ca-b5e5b94c9604"
  },
  {
    "id": "ae7f099e-a370-42f7-98ae-df70b572b4c5",
    "id_usuario": "96506cf3-e81d-4045-9e14-472a2be40f1f"
  },
  {
    "id": "2feb1c41-db3d-41f2-86d7-4d698b06e139",
    "id_usuario": "a5118f58-e863-4858-9444-7a438b94f279"
  },
  {
    "id": "697718ad-4216-4a28-bb3e-d43970331e81",
    "id_usuario": "5ed4246d-fcda-4327-9282-38db1e6d16d5"
  },
  {
    "id": "38129b1d-ec06-41e7-bc4b-0bc2998139c1",
    "id_usuario": "8fae3c7a-f494-4bf0-87f0-9eb4369986c4"
  },
  {
    "id": "902a72a1-972c-49a8-b8f0-1c3cf20dddd1",
    "id_usuario": "32b88898-4e88-40d0-8f12-5dc3fdd22add"
  },
  {
    "id": "77238991-a923-4118-8310-54fdcb75d917",
    "id_usuario": "7710f768-9059-4a47-b569-619ce0251d84"
  },
  {
    "id": "7f830f77-2c0f-4288-8eee-7b0d5f90b914",
    "id_usuario": "23202c73-af98-44fe-9686-49df4b69b05c"
  },
  {
    "id": "54ec4d9c-a2c1-4029-852e-a4d00c123d3e",
    "id_usuario": "38ad9cae-ba63-4316-9bd1-1a3d4f6a7ca0"
  },
  {
    "id": "34a7f5dc-ec94-4ade-8571-1f8f9cd4b80b",
    "id_usuario": "6c3ebb34-c66a-4f97-8ff7-2f977b113760"
  },
  {
    "id": "cd26d52c-380c-4821-a02a-883feffa0ad5",
    "id_usuario": "8a633afd-367f-4a15-aea2-eab8e76fca61"
  },
  {
    "id": "699d77e5-7204-4262-835c-66bbdd8d93bb",
    "id_usuario": "66094f06-6247-4e1b-9766-4ab4dc0ac2e7"
  },
  {
    "id": "d5baf57e-b64c-4761-bf05-8203932856ee",
    "id_usuario": "604f54a4-7e9a-4ecd-9f07-989772129ff9"
  },
  {
    "id": "bf05e1f2-7337-4cf6-afd9-0bb8520cfbb1",
    "id_usuario": "5b47af4c-5627-4633-b8a9-82b435c76cef"
  },
  {
    "id": "1e95ff05-20d9-4fe5-be0f-08faa9e02be0",
    "id_usuario": "f6f0ea2d-ecae-4929-9dd3-a4de629a338b"
  },
  {
    "id": "28046295-ff67-4ef1-949f-a32ba06c0036",
    "id_usuario": "697c9d9b-aff3-483d-8f93-ff95edb2d999"
  },
  {
    "id": "788de812-75bf-4a28-b701-0795dffd9afc",
    "id_usuario": "abf78684-4819-4805-8ee9-f0869b8c359a"
  },
  {
    "id": "b19e2fe4-ad31-4088-aad6-a9533d83d8aa",
    "id_usuario": "dea1d944-3388-4592-867e-f825b2869d24"
  },
  {
    "id": "2fef2d6e-870d-47a6-b52d-7ef942a27c0c",
    "id_usuario": "7e323016-7297-4d18-b477-779865926c6c"
  },
  {
    "id": "f0871329-1a0c-4a66-8407-98cf33de039f",
    "id_usuario": "60a4e828-a081-4480-adfb-3301f0fe03e3"
  },
  {
    "id": "bdf85453-fb77-47e1-b36a-1674d1e29122",
    "id_usuario": "4ea4733a-7e3b-4343-aaa7-97a4937ad487"
  },
  {
    "id": "eb9ef3b7-e38f-44cf-a9b9-47c41c3ce56e",
    "id_usuario": "a7988851-876c-4b69-95e2-cffb3031032e"
  },
  {
    "id": "26f27315-3ff6-47f1-9b0b-7adb276e2b40",
    "id_usuario": "b0984729-369a-47de-a5f0-ba9dd6743fcb"
  },
  {
    "id": "b5dc69df-7e9b-4bdf-b39b-05fa4cb87824",
    "id_usuario": "8239108c-30ec-414b-a0d0-3f87a301573a"
  },
  {
    "id": "e543a2c0-7f20-4f25-942f-3c7490db7195",
    "id_usuario": "beef4814-cbe3-4e63-818f-62dbcb1df71e"
  },
  {
    "id": "51164883-1ad9-44ea-8137-42344acfa84e",
    "id_usuario": "efd5ac36-f4cd-4f68-8b16-f33d4384e34c"
  },
  {
    "id": "60b54638-2a38-4a7d-b9cf-42d4d1ab63af",
    "id_usuario": "462edc12-bc8c-4abb-9b8f-dcb6b72c0093"
  },
  {
    "id": "0171c322-3941-4d41-aae1-d30feb679453",
    "id_usuario": "34a2ebf2-9f8b-433a-b46e-6bb091a523dd"
  },
  {
    "id": "35fd0cb0-3530-4c0f-89a6-dff8fe9431b7",
    "id_usuario": "30615d26-8338-4039-88f7-7b92765f989d"
  },
  {
    "id": "0bf2ab4c-a7ef-4a0f-a865-53948523508e",
    "id_usuario": "6b995b1e-8b26-4a5c-b94c-fb1e9f91aedc"
  },
  {
    "id": "ae20a38c-6c91-44d9-8e21-cb2e2d16e192",
    "id_usuario": "718f379d-a2dd-43a4-9d90-a346a751d4dc"
  },
  {
    "id": "560899c5-d4fb-44f4-845c-4e3bf8d62b6f",
    "id_usuario": "f3cc43da-bbcc-4dca-89c6-a7c122feca24"
  },
  {
    "id": "fef56755-3fe7-43d3-8a00-2c0442b63cba",
    "id_usuario": "4ae9e78e-137d-457e-9833-915418ee5ade"
  },
  {
    "id": "4eb3ae71-7f48-4e40-b241-5dbf425a84f2",
    "id_usuario": "9ece807b-9f7f-42e2-bbbb-d9b25f0fc867"
  },
  {
    "id": "e48b7ecc-5913-44d0-8b22-fcafc3af1720",
    "id_usuario": "29047cd0-3fdd-4978-9d63-a2b68ac906bc"
  }
]
```

### [CRÍTICO] ROL_INSTITUCION_CON_SEDE
* **Descripción:** Asignaciones con ámbito INSTITUCION que tienen sedeId asignado
* **Detalles:**
```json
[
  {
    "id": "dc071972-50ea-47ba-b718-c8a707eeba38",
    "id_usuario": "8c557754-26c0-4f3e-a14f-ac45598a98b4",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "ec7d6266-ff60-4de1-af83-72a0c305c8fc",
    "id_usuario": "44965ea2-e8e9-447f-8ec1-f894e022a6bf",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "b6258820-3a8b-4217-8ef2-4ed1d2342b8a",
    "id_usuario": "73e91c8d-dd41-44d9-99c1-ec12599a49b8",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "39c574e5-7fe7-4429-923e-089dc1e0086f",
    "id_usuario": "98372d24-fe94-431e-b208-7f598f486d85",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "af0a18b0-b9e8-49e7-a0f3-930defad25eb",
    "id_usuario": "fa2785c9-8918-472a-aded-354e2fb7bebe",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "08e46eb9-c7cc-473c-8fd4-8873fdb616a0",
    "id_usuario": "6d9e6a27-9ba0-43bf-8360-c7d4a2839966",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "18a12541-8458-4a03-b82c-5cc6a0ac898b",
    "id_usuario": "8893d37e-83cc-4e28-965f-579f68aeed87",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "c0922228-bc6f-411d-a3af-8ac5b48a07b7",
    "id_usuario": "f560adc9-bec3-4f8b-81bf-ab685612d704",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "1fce712b-0b00-4449-a750-523dd871625c",
    "id_usuario": "f7ff16fd-8164-4d95-affa-25ee2c9eb60a",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "da504186-53ac-4e68-9177-ffb54dbe6446",
    "id_usuario": "e3febe94-c1af-47c4-a58a-96d8a586d439",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "c8801770-ac36-4edf-85ae-e37fe29568ea",
    "id_usuario": "fe7d1783-afcc-436a-a04e-fc51dc7a6cc4",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "12b6013b-9ea1-43c2-a218-e34063c87c72",
    "id_usuario": "2dad9995-bf81-46a5-9165-162377fd212e",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "d8f3f5c8-b8d6-474e-98f7-0bb6837a4c77",
    "id_usuario": "7d4e1988-8750-4dd5-86ef-d69ea3c93ff1",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "eba6f2af-11df-4a1c-99fe-46819f54e28d",
    "id_usuario": "103e9a1b-28f6-426e-9273-95d7d024d6ec",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "aac53402-1596-4bad-a8b1-90c60da0c8b0",
    "id_usuario": "c537d8d2-f215-4c64-8dc3-9d8ebc492c82",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "29b0373f-e31f-4b7d-b5bd-ed43e0026397",
    "id_usuario": "a54a7f99-26ef-4c40-afd6-2c8e7f6affef",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "47df92dc-ec0d-4a13-bffd-dda1ad20158c",
    "id_usuario": "5cc88c1c-e2e6-4aac-b658-afcc9dda96c2",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "cdd5db53-e2fc-43f1-b029-757f2bc6c332",
    "id_usuario": "5ed4246d-fcda-4327-9282-38db1e6d16d5",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "ea8476f1-1240-49db-9710-b54ca4970505",
    "id_usuario": "23202c73-af98-44fe-9686-49df4b69b05c",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "10d9cbdf-5a51-4634-b071-796a0eecd57d",
    "id_usuario": "5b47af4c-5627-4633-b8a9-82b435c76cef",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "650d6a7e-3a68-4e83-9448-6596ddc287e0",
    "id_usuario": "b0984729-369a-47de-a5f0-ba9dd6743fcb",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "04559c87-d6bb-44a1-b08b-e62ed50aa66a",
    "id_usuario": "8239108c-30ec-414b-a0d0-3f87a301573a",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  },
  {
    "id": "a218a7da-1f18-4bf7-b36a-53679a6eaac6",
    "id_usuario": "29047cd0-3fdd-4978-9d63-a2b68ac906bc",
    "codigo": "ADMINISTRADOR_INSTITUCION"
  }
]
```

### [ADVERTENCIA] ESTUDIANTE_SIN_USUARIO_PRUEBA
* **Descripción:** Estudiantes de prueba que no tienen usuario asociado
* **Detalles:**
```json
[
  {
    "id": "70d87f33-94d2-435e-a240-d27d167eeaa4",
    "codigo": "EST-001"
  },
  {
    "id": "c068d5dc-f034-4f86-a575-caf3e8497ddf",
    "codigo": "EST-002"
  }
]
```

### [ADVERTENCIA] APODERADO_SIN_USUARIO
* **Descripción:** Apoderados sin usuario asociado
* **Detalles:**
```json
[
  {
    "id": "812da919-4df7-4d1d-8766-0058e3fccfef",
    "nombres": "Carlos"
  }
]
```

### [ADVERTENCIA] PERSONAS_DUPLICADAS
* **Descripción:** Personas con nombres y apellidos idénticos
* **Detalles:**
```json
[
  {
    "nombres": "Bruno",
    "apellido_paterno": "Diaz",
    "apellido_materno": "Ruiz",
    "count": "5"
  },
  {
    "nombres": "Persona",
    "apellido_paterno": "B",
    "apellido_materno": "Test",
    "count": "23"
  },
  {
    "nombres": "Ana",
    "apellido_paterno": "Perez",
    "apellido_materno": "Lopez",
    "count": "5"
  },
  {
    "nombres": "Persona",
    "apellido_paterno": "A",
    "apellido_materno": "Test",
    "count": "23"
  },
  {
    "nombres": "Carlos",
    "apellido_paterno": "Gomez",
    "apellido_materno": "Soto",
    "count": "5"
  },
  {
    "nombres": "Persona",
    "apellido_paterno": "Demo",
    "apellido_materno": "Ejemplo",
    "count": "5"
  }
]
```

