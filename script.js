function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const isHidden = sidebar.getAttribute("aria-hidden") === "true";
  sidebar.setAttribute("aria-hidden", !isHidden);
}

function searchCards() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const cards = document.querySelectorAll(".card");
  cards.forEach(card => {
    const text = card.innerText.toLowerCase();
    card.style.display = text.includes(input) ? "block" : "none";
  });
}