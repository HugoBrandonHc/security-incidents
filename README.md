# **Gestión de Incidentes de Seguridad - Proyecto en AWS**

## **Descripción**
Esta aplicación web permite registrar, almacenar y consultar incidentes de seguridad. Es parte de mi aprendizaje práctico de AWS, enfocado en implementar múltiples servicios dentro de la capa gratuita y profundizar en su funcionamiento real.

El objetivo es no solo practicar para la certificación **AWS Certified Cloud Practitioner**, sino también compartir conocimientos para que otros puedan replicar y aprender de esta experiencia.

---

## **Objetivo**
Desarrollar una solución eficiente y escalable que permita:
- Registrar incidentes de seguridad con detalles como descripción, prioridad y estado.
- Subir y almacenar archivos PDF relacionados con los incidentes.
- Consultar, buscar y filtrar los incidentes registrados.
- Garantizar seguridad, optimización de costos y monitoreo continuo con AWS.

---

## **Servicios de AWS Utilizados**
1. **Frontend:** AWS Amplify.
2. **Backend:** API Gateway, AWS Lambda.
3. **Base de Datos:** DynamoDB.
4. **Almacenamiento:** Amazon S3.
5. **Seguridad:** IAM, WAF.
6. **Entrega de Contenido:** CloudFront.
7. **Monitoreo:** CloudWatch y Cost Explorer.

---

## **Guía Paso a Paso**

### **1. Configuración de AWS Amplify**
1. **Crear la aplicación frontend:**
   - Clonar el repositorio:
     ```bash
     git clone https://github.com/tu-usuario/tu-repo.git
     cd tu-repo
     ```
   - Conecta el repositorio a AWS Amplify:
     1. Ve a AWS Amplify y selecciona "Conectar aplicación".
     2. Selecciona GitHub y elige tu repositorio.
   - Configura el comando de compilación:
     ```bash
     npm run build
     ```
   - Publica la aplicación y obtén el dominio.

2. **Probar el frontend:**
   - Asegúrate de que el formulario carga correctamente en el dominio generado.

---

### **2. Crear y Configurar API Gateway**
1. **Crear una API REST:**
   - Define las rutas:
     - `POST /incidentes`: Para registrar incidentes.
     - `GET /listar`: Para listar los incidentes.
   - Conecta cada ruta a su correspondiente Lambda.

2. **Configurar CORS:**
   - En ambas rutas, habilita CORS para permitir solicitudes desde tu dominio de Amplify y CloudFront.

3. **Probar con Postman:**
   - Configura los métodos POST y GET en Postman:
     - **POST:** Envía un JSON como este:
       ```json
       {
           "id_incidente": "incidente-001",
           "descripcion": "Falla crítica en el servidor",
           "estado": "Abierto",
           "prioridad": "Alta",
           "archivo": "BASE64_DE_TU_PDF"
       }
       ```
     - **GET:** Obtendrás un listado de incidentes registrados.

---

### **3. Configurar AWS Lambda**
1. **Registrar Incidente (POST):**
   - Código Lambda:
     ```javascript
     const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
     const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

     const s3 = new S3Client({ region: "us-east-2" });
     const dynamoDB = new DynamoDBClient({ region: "us-east-2" });

     exports.handler = async (event) => {
         const bucketName = "tu-bucket";
         const folder = "pdf/";
         const body = JSON.parse(event.body);

         const { id_incidente, descripcion, estado, prioridad, archivo } = body;
         const fileName = `${folder}${id_incidente}.pdf`;
         const fileContent = Buffer.from(archivo, "base64");

         try {
             await s3.send(new PutObjectCommand({
                 Bucket: bucketName,
                 Key: fileName,
                 Body: fileContent,
                 ContentType: "application/pdf",
             }));

             await dynamoDB.send(new PutItemCommand({
                 TableName: "IncidentesSeguridad",
                 Item: {
                     id_incidente: { S: id_incidente },
                     descripcion: { S: descripcion },
                     estado: { S: estado },
                     prioridad: { S: prioridad },
                     archivo_s3: { S: `s3://${bucketName}/${fileName}` },
                 },
             }));

             return { statusCode: 200, body: JSON.stringify({ message: "Incidente registrado correctamente" }) };
         } catch (error) {
             return { statusCode: 500, body: JSON.stringify({ message: "Error al registrar incidente", error }) };
         }
     };
     ```

2. **Listar Incidentes (GET):**
   - Código Lambda:
     ```javascript
     const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
     const dynamoDB = new DynamoDBClient({ region: "us-east-2" });

     exports.handler = async () => {
         try {
             const data = await dynamoDB.send(new ScanCommand({ TableName: "IncidentesSeguridad" }));
             const items = data.Items.map(item => ({
                 id_incidente: item.id_incidente.S,
                 descripcion: item.descripcion.S,
                 estado: item.estado.S,
                 prioridad: item.prioridad.S,
                 archivo_s3: item.archivo_s3.S,
             }));

             return { statusCode: 200, body: JSON.stringify(items) };
         } catch (error) {
             return { statusCode: 500, body: JSON.stringify({ message: "Error al listar incidentes", error }) };
         }
     };
     ```

3. **Pruebas:**  
   - Ejecuta pruebas desde API Gateway y Postman.

---

### **4. Configurar S3**
1. Crea un bucket llamado `tu-bucket`.
2. Configura una política pública:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Principal": "*",
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::tu-bucket/pdf/*"
           }
       ]
   }

Añadir gráficos con Amazon QuickSight.
Explorar autenticación con Cognito en futuros proyectos.
Contacto
GitHub: [Tu Perfil]
Correo: [Tu Correo]
