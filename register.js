document.getElementById("form-register").addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const email = document.getElementById("email").value;

    try {
        const user = await Amplify.Auth.signUp({
            username,
            password,
            attributes: {
                email, // Asegúrate de que "email" está habilitado como atributo en Cognito
            },
        });

        document.getElementById("resultado").innerText = "Registro exitoso. Revisa tu correo para confirmar.";
        console.log("Usuario registrado:", user);
    } catch (error) {
        console.error("Error durante el registro:", error);
        document.getElementById("resultado").innerText = `Error: ${error.message}`;
    }
});
