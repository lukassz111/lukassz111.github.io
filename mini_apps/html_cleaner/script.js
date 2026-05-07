const input = document.getElementById("input");
const output = document.getElementById("output");

const options = [
  {
    label: "Usuń wszystkie zmienne css z Tailwind CSS",
    id: "remove-tw-styles-vars",
    action: function (element) {
      function removeTwVarsFromString(str) {
        return str.replace(/--tw-[a-zA-Z0-9-]+\s*:[^;]+;?/g, "").trim();
      }
      const allElements = element.querySelectorAll("*");

      allElements.forEach((el) => {
        if (el.style && el.hasAttribute("style")) {
          const styles = el.style.cssText;
          const cleanedStyles = removeTwVarsFromString(styles);
          el.style.cssText = cleanedStyles;
        }
      });

      const allStyles = element.querySelectorAll("style");
      allStyles.forEach((styleEl) => {
        styleEl.textContent = removeTwVarsFromString(styleEl.textContent);
      });
    },
  },
  {
    label: "Usuń wszystkie style tła",
    id: "remove-background-styles",
    action: function (element) {
      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        if (el.style) {
          el.style.removeProperty("background");
          el.style.removeProperty("background-color");
        }
      });
    },
  },
  {
    label: "Usuń puste atrybuty",
    id: "remove-empty-attributes",
    action: function (element) {
      const allElements = element.querySelectorAll("*");
      allElements.forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (attr.value.trim() === "") {
            el.removeAttribute(attr.name);
          }
        });
      });
    },
  }
];

const createCheckboxesForOptions = () => {
    const optionsContainer = document.querySelector(".options");
    options.forEach((option) => {
        const optionWrapper = document.createElement("div");
        optionWrapper.classList.add("option-wrapper");
        optionsContainer.appendChild(optionWrapper);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("option-checkbox");
        checkbox.setAttribute("data-action", option.id);

        if (localStorage.getItem("option-" + option.id) === "true") {
            checkbox.checked = true;
        }
        checkbox.addEventListener("change", (e) => {
            localStorage.setItem("option-" + option.id, e.target.checked);
        });

        const label = document.createElement("label");
        label.htmlFor = option.id;
        label.textContent = option.label;
        optionWrapper.appendChild(checkbox);
        optionWrapper.appendChild(label);
    });
};

createCheckboxesForOptions();

input.addEventListener("input", () => {
  const html = input.value;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  options.forEach((option) => {
    const checkbox = document.querySelector(`.option-checkbox[data-action="${option.id}"]`);
    if (checkbox && checkbox.checked) {
      console.log("Applying option:", option.label);   
      option.action(doc);
    }
  });

  output.value = doc.body.innerHTML;
});

function copyOutput() {
  output.select();
  document.execCommand("copy");

  const btn = document.querySelector(".btn-copy");
  const originalText = btn.textContent;
  btn.textContent = "Skopiowano!";
  setTimeout(() => {
    btn.textContent = originalText;
  }, 1500);
}

document.getElementById("cpy-btn").addEventListener("click", copyOutput);
