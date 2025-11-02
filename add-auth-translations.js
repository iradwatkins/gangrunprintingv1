const fs = require('fs');

// Read existing translations
const en = JSON.parse(fs.readFileSync('./messages/en.json', 'utf8'));
const es = JSON.parse(fs.readFileSync('./messages/es.json', 'utf8'));

// Add English auth translations
en.auth = {
  signin: {
    title: "Sign in to GangRun Printing",
    subtitle: "Choose your preferred sign-in method",
    googleButton: "Continue with Google",
    orDivider: "Or continue with email",
    emailLabel: "Email Address",
    emailRequired: "Email Address *",
    emailPlaceholder: "you@example.com",
    nameLabel: "Name (optional)",
    namePlaceholder: "Your name",
    sendButton: "Send Magic Link",
    sendingButton: "Sending...",
    successMessage: "Magic link sent! Check your email to sign in.",
    errorMessage: "Something went wrong. Please try again.",
    noAccountMessage: "Don't have an account? No problem! We'll create one for you automatically."
  }
};

// Add Spanish auth translations
es.auth = {
  signin: {
    title: "Iniciar sesión en GangRun Printing",
    subtitle: "Elija su método de inicio de sesión preferido",
    googleButton: "Continuar con Google",
    orDivider: "O continuar con correo electrónico",
    emailLabel: "Correo Electrónico",
    emailRequired: "Correo Electrónico *",
    emailPlaceholder: "tu@ejemplo.com",
    nameLabel: "Nombre (opcional)",
    namePlaceholder: "Tu nombre",
    sendButton: "Enviar Enlace Mágico",
    sendingButton: "Enviando...",
    successMessage: "¡Enlace mágico enviado! Revisa tu correo electrónico para iniciar sesión.",
    errorMessage: "Algo salió mal. Por favor, inténtalo de nuevo.",
    noAccountMessage: "¿No tienes una cuenta? ¡No hay problema! Crearemos una para ti automáticamente."
  }
};

// Write back
fs.writeFileSync('./messages/en.json', JSON.stringify(en, null, 2));
fs.writeFileSync('./messages/es.json', JSON.stringify(es, null, 2));

console.log('✅ Auth translations added successfully!');
