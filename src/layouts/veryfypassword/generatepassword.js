// Función para generar una contraseña segura
function generateSecurePassword() {
    const length = 16; // Longitud de la contraseña generada
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(),.?\":{}|<>";
    let password = "";
  
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
  
    return password;
  }
  
  // Referencia a los elementos del DOM
  const generateButton = document.getElementById("generatePassword");
  const passwordGeneratedInput = document.getElementById("passwordGenerated");
  const copyGeneratedButton = document.getElementById("copyGeneratedPassword");
  
  // Evento para generar una contraseña segura
  generateButton.addEventListener("click", () => {
    const generatedPassword = generateSecurePassword();
    
    // Asignar la contraseña generada al campo correcto
    passwordGeneratedInput.value = generatedPassword;
  
    // Mensaje de éxito
    message2.style.color = "#3498db";
    message2.textContent = "✔️ Se generó una contraseña segura. Puedes copiarla desde el botón.";
  });
  
  // Evento para copiar la contraseña generada
  copyGeneratedButton.addEventListener("click", () => {
    const password = passwordGeneratedInput.value;
  
    if (password.trim() === "") {
      message2.style.color = "#e74c3c";
      message2.textContent = "No hay contraseña para copiar.";
      return;
    }
  
    // Copiar al portapapeles
    navigator.clipboard.writeText(password)
      .then(() => {
        message2.style.color = "#2ecc71";
        message2.textContent = "✔️ Contraseña copiada al portapapeles.";
      })
      .catch(() => {
        message2.style.color = "#e74c3c";
        message2.textContent = "❌ No se pudo copiar la contraseña.";
      });
  });
  