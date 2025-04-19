const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");

// Replace this with your actual key in production — store safely
const apiKey = "your-new-api-key";

let appointments = getStoredAppointments();
let appointmentDetails = { doctor: "", date: "", time: "", reason: "" };

// Util functions
function saveAppointments(data) {
  localStorage.setItem('appointments', JSON.stringify(data));
}

function getStoredAppointments() {
  const saved = localStorage.getItem('appointments');
  return saved ? JSON.parse(saved) : [];
}

function clearInput() {
  input.value = "";
}

function displayChatbotMessage(message) {
  messages.innerHTML += `
    <div class="message bot-message">
      <img src="chatbot.webp" alt="Chatbot"> <span>${message}</span>
    </div>`;
  messages.scrollTop = messages.scrollHeight;
}

function displayUserMessage(message) {
  messages.innerHTML += `
    <div class="message user-message">
      <img src="photo.png" alt="User"> <span>${message}</span>
    </div>`;
  messages.scrollTop = messages.scrollHeight;
}

// Main chat handler
async function handleChatSubmission(e) {
  e.preventDefault();
  const message = input.value.trim();
  if (!message) return;

  displayUserMessage(message);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        prompt: `You are a healthcare assistant. Provide simple explanations of the uses, side effects, and precautions for the medicine or health topic: "${message}"`,
        model: "gpt-3.5-turbo-instruct",
        temperature: 0.5,
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const botMessage = response.data.choices[0].text.trim();
    displayChatbotMessage(botMessage);

    if (message.toLowerCase().includes("appointment")) {
      handleAppointmentInitiation();
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    displayChatbotMessage("Sorry, I couldn't process your request.");
  }

  clearInput();
}

// Appointment logic (same as before, kept clean)
function handleAppointmentInitiation() {
  displayChatbotMessage("Let's schedule an appointment. Please provide:");
  displayChatbotMessage("1. Doctor's name (e.g., Dr. S.K. Patil or Dr. V.P. Sharma)");
  form.removeEventListener("submit", handleChatSubmission);
  form.addEventListener("submit", handleDoctorNameInput);
}

function handleDoctorNameInput(e) {
  e.preventDefault();
  appointmentDetails.doctor = input.value.trim();
  displayChatbotMessage(`Doctor set to: ${appointmentDetails.doctor}`);
  displayChatbotMessage("2. Date (YYYY-MM-DD)");
  form.removeEventListener("submit", handleDoctorNameInput);
  form.addEventListener("submit", handleDateInput);
  clearInput();
}

function handleDateInput(e) {
  e.preventDefault();
  appointmentDetails.date = input.value.trim();
  displayChatbotMessage(`Date: ${appointmentDetails.date}`);
  displayChatbotMessage("3. Preferred time:");
  form.removeEventListener("submit", handleDateInput);
  form.addEventListener("submit", handleTimeInput);
  clearInput();
}

function handleTimeInput(e) {
  e.preventDefault();
  appointmentDetails.time = input.value.trim();
  displayChatbotMessage(`Time: ${appointmentDetails.time}`);
  displayChatbotMessage("4. Reason for appointment:");
  form.removeEventListener("submit", handleTimeInput);
  form.addEventListener("submit", handleReasonInput);
  clearInput();
}

function handleReasonInput(e) {
  e.preventDefault();
  appointmentDetails.reason = input.value.trim();
  appointments.push({ ...appointmentDetails });
  saveAppointments(appointments);

  displayChatbotMessage(`✅ Appointment confirmed with ${appointmentDetails.doctor} on ${appointmentDetails.date} at ${appointmentDetails.time} for: ${appointmentDetails.reason}`);

  form.removeEventListener("submit", handleReasonInput);
  form.addEventListener("submit", handleChatSubmission);
  clearInput();
}

form.addEventListener("submit", handleChatSubmission);
