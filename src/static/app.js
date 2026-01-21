document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Add participants section (no bullets, with delete icon)
        let participantsHTML = '';
        if (details.participants && details.participants.length) {
          participantsHTML = `<div class="participants"><strong>Participants:</strong><ul class="participants-list" style="list-style-type:none;padding-left:0;">${details.participants.map(p => `
            <li style="display:flex;align-items:center;margin-bottom:2px;">
              <span>${p}</span>
              <button class="delete-btn" data-activity="${name}" data-email="${p}" title="Remove" style="background:none;border:none;color:#c00;margin-left:8px;cursor:pointer;font-size:1.1em;">&#128465;</button>
            </li>`).join("")}</ul></div>`;
        } else {
          participantsHTML = `<p class="no-participants"><strong>Participants:</strong> No participants yet</p>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
      // Handle participant delete (unregister)
      document.addEventListener("click", async (event) => {
        if (event.target.classList.contains("delete-btn")) {
          const activity = event.target.getAttribute("data-activity");
          const email = event.target.getAttribute("data-email");
          if (activity && email && confirm(`Remove participant: ${email} from ${activity}?`)) {
            try {
              const response = await fetch(`/activities/${encodeURIComponent(activity)}/unregister`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ activity_name: activity, email }),
              });
              const result = await response.json();
              if (response.ok) {
                // Refresh activities list
                fetchActivities();
              } else {
                alert(result.detail || "Failed to remove participant.");
              }
            } catch (error) {
              alert("Failed to remove participant. Please try again.");
            }
          }
        }
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
