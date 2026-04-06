const copyButtons = document.querySelectorAll("[data-copy-link]");

for (const button of copyButtons) {
  const defaultLabel = button.textContent;

  button.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      button.textContent = "Link copiado";
      button.dataset.state = "success";
    } catch (error) {
      button.textContent = "Copie pela barra";
      button.dataset.state = "error";
    }

    window.setTimeout(() => {
      button.textContent = defaultLabel;
      button.removeAttribute("data-state");
    }, 1800);
  });
}
