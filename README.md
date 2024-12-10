# **🛡️ Gestión de Incidentes de Seguridad - Proyecto en AWS**
## 🎨 Vista Previa del Frontend
![Vista del Frontend](assets/fronted-preview.png)

---

## **📋 Índice**
1. [📖 Descripción](#-descripción)
2. [🎯 Objetivo](#-objetivo)
3. [⚙️ Servicios de AWS Utilizados](#️-servicios-de-aws-utilizados)
4. [🏗️ Arquitectura](#-arquitectura)
5. [🛠️ Guía Paso a Paso](#️-guía-paso-a-paso)
   - [🚀 1. Configuración de AWS Amplify](#-1-configuración-de-aws-amplify)
   - [🌉 2. Crear y Configurar API Gateway](#-2-crear-y-configurar-api-gateway)
   - [📝 3. Configurar AWS Lambda](#-3-configurar-aws-lambda)
   - [💾 4. Configurar S3](#-4-configurar-s3)
   - [🌐 5. Configurar CloudFront y WAF](#-5-configurar-cloudfront-y-waf)
6. [📊 Lecciones Aprendidas](#-lecciones-aprendidas)
7. [🔜 Próximos Pasos](#-próximos-pasos)
8. [🌟 Reflexiones y Conexión con la Comunidad](#-reflexiones-sobre-lo-aprendido)
9. [📬 Contacto](#-contacto)

---

 ## 📖 **Descripción**
Este proyecto es una plataforma web diseñada para gestionar incidentes de seguridad de manera eficiente. Forma parte de mi aprendizaje práctico de AWS. El objetivo es implementar una solución real que utilice múltiples servicios de AWS, aprendiendo su configuración, integración y gestión dentro de la capa gratuita.

---

## 🎯 **Objetivo**
Desarrollar una plataforma centralizada para registrar, almacenar y consultar incidentes de seguridad, integrando servicios de AWS para garantizar escalabilidad, seguridad y eficiencia.
- Registrar incidentes de seguridad con detalles como descripción, prioridad y estado.
- Subir y almacenar archivos PDF relacionados con los incidentes.
- Consultar, buscar y filtrar los incidentes registrados.
- Garantizar seguridad, optimización de costos y monitoreo continuo con AWS.

---

## ⚙️ **Servicios de AWS Utilizados**
1. **Frontend:** AWS Amplify.
2. **Backend:** API Gateway, AWS Lambda.
3. **Base de Datos:** DynamoDB.
4. **Almacenamiento:** Amazon S3.
5. **Seguridad:** IAM, WAF.
6. **Entrega de Contenido:** CloudFront.
7. **Monitoreo:** CloudWatch y Cost Explorer.

---
## 🏗️ **Arquitectura**

![Diagrama de Arquitectura](assets/arquitectura.png)

---

## 🛠️ **Guía Paso a Paso**

### **🚀 1. Configuración de AWS Amplify**
1. **Crear la aplicación frontend:**
   - Clonar el repositorio:
     ```bash
     git clone https://github.com/HugoBrandonHc/security-incidents.git
     cd security-incidents
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

### **🌉 2. Crear y Configurar API Gateway**
1. **Crear una API REST:**
   - Define las rutas:
     - `POST /incidentes`: Para registrar incidentes.
     - `GET /listar`: Para listar los incidentes.
   - Conecta cada ruta a su correspondiente Lambda.

2. **Configurar CORS:**
   - En ambas rutas, habilita CORS para permitir solicitudes desde tu dominio de Amplify y CloudFront.

3. **Probar con Imsomnia:**
   - Configura los métodos POST y GET en Imsomnia:
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

### 📝 **3. Configurar AWS Lambda**
1. **Registrar Incidente (POST):**
   - Código Lambda:
     ```javascript
      const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
      const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
      
      const s3 = new S3Client({ region: "us-east-2" });
      const dynamoDB = new DynamoDBClient({ region: "us-east-2" });
      
      exports.handler = async (event) => {
          // Manejar solicitud preflight (OPTIONS)
          if (event.requestContext?.http?.method === "OPTIONS") {
              return {
                  statusCode: 200,
                  headers: {
                      "Access-Control-Allow-Origin": "*",
                      "Access-Control-Allow-Methods": "OPTIONS,POST",
                      "Access-Control-Allow-Headers": "Content-Type"
                  },
                  body: null,
              };
          }
      
          const bucketName = "incidentes-seguridad-hugo";
          const folder = "pdf/";
      
          let body;
          try {
              body = JSON.parse(event.body); // Intenta parsear el cuerpo
          } catch (err) {
              console.error("Error parsing body:", err);
              return {
                  statusCode: 400,
                  body: JSON.stringify({ message: "El cuerpo de la solicitud no es válido" })
              };
          }
      
          const { id_incidente, descripcion, estado, fecha_creacion, prioridad, archivo } = body || {};
          const fileName = `${folder}${id_incidente}.pdf`;
          const fileContent = Buffer.from(archivo, "base64");
      
          try {
              // Subir el archivo a S3
              const uploadParams = {
                  Bucket: bucketName,
                  Key: fileName,
                  Body: fileContent,
                  ContentType: "application/pdf",
              };
              await s3.send(new PutObjectCommand(uploadParams));
      
              // Guardar detalles en DynamoDB
              const params = {
                  TableName: "IncidentesSeguridad",
                  Item: {
                      id_incidente: { S: id_incidente },
                      descripcion: { S: descripcion },
                      estado: { S: estado },
                      fecha_creacion: { S: fecha_creacion },
                      prioridad: { S: prioridad },
                      archivo_s3: { S: `s3://${bucketName}/${fileName}` },
                  },
              };
              await dynamoDB.send(new PutItemCommand(params));
      
              // Respuesta exitosa con CORS
              return {
                  statusCode: 200,
                  headers: {
                      "Access-Control-Allow-Origin": "*",
                      "Access-Control-Allow-Methods": "OPTIONS,POST",
                      "Access-Control-Allow-Headers": "Content-Type"
                  },
                  body: JSON.stringify({ message: "Incidente registrado correctamente" }),
              };
          } catch (error) {
              console.error(error);
              return {
                  statusCode: 500,
                  headers: {
                      "Access-Control-Allow-Origin": "*",
                  },
                  body: JSON.stringify({ message: "Error al procesar el incidente", error }),
              };
          }
      };

     ```

3. **Pruebas:**  
   - Ejecuta pruebas desde API Gateway y Imsomnia.

---

### 💾 **4. Configurar S3**
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

### 🌐 **5. Configurar CloudFront y WAF**
1. **CloudFront**
   - Conecta CloudFront al dominio de Amplify
   - Configura políticas de caché y HTTPS
2. **WAF**
   - Configura reglas básicas para bloquear solicitudes maliciosas

## 📊 **Lecciones aprendidas**
   - Configuración y uso de múltiples servicios de AWS.
   - Implementación de un backend sin servidor.
   - Gestión de costos y optimización de la capa gratuita.

## 🔜 **Próximos pasos** 
   - Añadir gráficos con Amazon QuickSight.
   - Explorar autenticación con Cognito en futuros proyectos.

---

## 🌟 **Reflexiones sobre lo aprendido**

Durante el desarrollo de este proyecto, aprendí a:
- Integrar múltiples servicios de **AWS** de manera eficiente y dentro de la capa gratuita.
- Configurar una arquitectura escalable y segura utilizando servicios como **CloudFront, S3, API Gateway, DynamoDB y Lambda**.
- Gestionar costos y recursos con herramientas como **CloudWatch** y **Cost Explorer**.
- Implementar una comunicación eficiente entre el **frontend** y el **backend** para construir una solución funcional y práctica.

Este proyecto me permitió consolidar mis conocimientos en AWS y adquirir experiencia práctica que va más allá de la teoría, preparándome para futuros retos.

---

### 💬 **Inspira y Comparte**
Este proyecto no solo representa un paso en mi aprendizaje, sino también una oportunidad para inspirar a otros a explorar el mundo de AWS. Si estás comenzando con los servicios de AWS, mi consejo es:
- ¡No tengas miedo de experimentar! 🧪
- Comienza con proyectos pequeños, construye y documenta sobre ellos. 🛠️
- Aprende de tus errores; cada error es una lección valiosa. 📚

Si este proyecto te ayudó o tienes alguna pregunta, no dudes en contactarme, ¡Comparte tus experiencias y juntos hagamos crecer la comunidad! 🌎

---

### **📬 Contacto**
- 💼 **LinkedIn:** [Mi Perfil](https://www.linkedin.com/in/hugobrandonhuaytacortez)
- 📧 **Correo:** [hugobrandon17@gmail.com](mailto:hugobrandon17@gmail.com)
- 🐙 **GitHub:** [Mi Repositorio](https://github.com/HugoBrandonHc/security-incidents)

## 📜 Licencia
Este proyecto está licenciado bajo los términos de la [Licencia](LICENSE.md). Es un proyecto de aprendizaje y no tiene fines de lucro.

