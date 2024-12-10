#Gestión de Incidentes de Seguridad - Proyecto en AWS
Descripción
Este proyecto es una plataforma web diseñada para registrar, almacenar y consultar incidentes de seguridad. Es parte de mi aprendizaje práctico de AWS, enfocado en implementar múltiples servicios dentro de la capa gratuita y profundizar en su funcionamiento real.

El objetivo es no solo practicar para la certificación AWS Certified Cloud Practitioner, sino también compartir conocimientos para que otros puedan replicar y aprender de esta experiencia.

Objetivo
Desarrollar una solución eficiente y escalable que permita:

Registrar incidentes de seguridad con detalles como descripción, prioridad y estado.
Subir y almacenar archivos PDF relacionados con los incidentes.
Consultar, buscar y filtrar los incidentes registrados.
Garantizar seguridad, optimización de costos y monitoreo continuo con AWS.
Servicios de AWS Utilizados
Frontend: AWS Amplify.
Backend: API Gateway, AWS Lambda.
Base de Datos: DynamoDB.
Almacenamiento: Amazon S3.
Seguridad: IAM, WAF.
Entrega de Contenido: CloudFront.
Monitoreo: CloudWatch y Cost Explorer.
Guía Paso a Paso
1. Configuración de AWS Amplify
Crear la aplicación frontend:

Clonar el repositorio:
bash
Copiar código
git clone https://github.com/tu-usuario/tu-repo.git
cd tu-repo
Conecta el repositorio a AWS Amplify:
Ve a AWS Amplify y selecciona "Conectar aplicación".
Selecciona GitHub y elige tu repositorio.
Configura el comando de compilación:
bash
Copiar código
npm run build
Publica la aplicación y obtén el dominio.
Probar el frontend:

Asegúrate de que el formulario carga correctamente en el dominio generado.
2. Crear y Configurar API Gateway
Crear una API REST:

Define las rutas:
POST /incidentes: Para registrar incidentes.
GET /listar: Para listar los incidentes.
Conecta cada ruta a su correspondiente Lambda.
Configurar CORS:

En ambas rutas, habilita CORS para permitir solicitudes desde tu dominio de Amplify y CloudFront.
Probar con Postman:

Configura los métodos POST y GET en Postman:
POST: Envía un JSON como este:
json
Copiar código
{
    "id_incidente": "incidente-001",
    "descripcion": "Falla crítica en el servidor",
    "estado": "Abierto",
    "prioridad": "Alta",
    "archivo": "BASE64_DE_TU_PDF"
}
GET: Obtendrás un listado de incidentes registrados.
3. Configurar AWS Lambda
Registrar Incidente (POST):

Código Lambda:
javascript
Copiar código
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
Listar Incidentes (GET):

Código Lambda:
javascript
Copiar código
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
Pruebas:

Ejecuta pruebas desde API Gateway y Postman.
4. Configurar S3
Crea un bucket llamado tu-bucket.
Configura una política pública:
json
Copiar código
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
5. Configurar CloudFront y WAF
CloudFront:

Conecta CloudFront al dominio de Amplify.
Configura políticas de caché y HTTPS.
WAF:

Configura reglas básicas para bloquear solicitudes maliciosas.
Lecciones Aprendidas
Configuración y uso de múltiples servicios de AWS.
Implementación de un backend sin servidor.
Gestión de costos y optimización de la capa gratuita.
Próximos Pasos
Añadir gráficos con Amazon QuickSight.
Explorar autenticación con Cognito en futuros proyectos.
Contacto
GitHub: [Tu Perfil]
Correo: [Tu Correo]
