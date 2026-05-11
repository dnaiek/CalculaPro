# CalculaPro

Calculadora web con autenticación de usuarios y guardado automático de cálculos en la nube. Proyecto desarrollado como parte de mi formación en Informática y Redes.

## Tecnologías utilizadas

- Frontend: HTML5, CSS3, Bootstrap 5, JavaScript (ES6+)
- Backend: Node.js, Azure Functions (serverless)
- Base de datos: Azure SQL Database
- Infraestructura: Microsoft Azure

## Funcionalidades

- Registro e inicio de sesión de usuarios
- Cuatro calculadoras: Sumatoria, Círculo (geometría), Velocidad (km/h, m/s, mi/h) e IMC
- Cada cálculo se guarda automáticamente en la nube
- Historial de cálculos por usuario en tiempo real
- Arquitectura de 3 capas: Frontend -> Azure Functions -> Azure SQL

## Estructura del proyecto

- index.html - Interfaz de usuario y modales
- style.css - Estilos y efectos visuales
- script.js - Lógica de calculadoras, autenticación y conexión con Azure

## Cómo probar el proyecto

Para ejecutar localmente:
1. Clonar el repositorio
2. Abrir index.html en un navegador
3. Las funcionalidades de nube requieren tener las Azure Functions desplegadas

## Contacto

daniel.paredesop@gmail.com
linkedin.com/in/daniel-paredes-139589406/
