document.getElementById("form-login").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("https://incidentes-app.auth.us-east-2.amazoncognito.com/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                password,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem("accessToken", data.accessToken); // Guarda el token
            document.getElementById("resultado").innerText = "Inicio de sesión exitoso. Redirigiendo...";
            setTimeout(() => {
                window.location.href = "index.html"; // Redirige al index después de unos segundos
            }, 2000);
        } else {
            const errorData = await response.json();
            document.getElementById("resultado").innerText = `Error: ${errorData.message}`;
        }
    } catch (error) {
        console.error("Error durante el inicio de sesión:", error);
        document.getElementById("resultado").innerText = "Error al iniciar sesión.";
    }
});
