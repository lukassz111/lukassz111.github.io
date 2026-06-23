const input = document.getElementById("input");
const output = document.getElementById("output");
input.value = JSON.stringify(["a", "b", "c"])


function shuffleArray(arr) {
  const result = [...arr]; // kopiujemy tablicę

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]; // zamiana miejsc
  }

  return result;
}


function process() {
  let jsonIn = input.value;
  let obj = null;
  try {
    obj = JSON.parse(jsonIn)
  } catch {
    output.value = "To nie jest poprawny json"
    obj = null;
  }

  if(obj == null) {
    return;
  }

  if(!Array.isArray(obj)) {
    output.value = "Nie potrafię mieszać czegoś innego niż tablica"
  }

  let newObj = shuffleArray(obj);

  

  let jsonOut = JSON.stringify(newObj)
  output.value = jsonOut;
  
}
process();

input.addEventListener("input", () => {
  process();
})

//   const html = input.value;
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");

//   options.forEach((option) => {
//     const checkbox = document.querySelector(`.option-checkbox[data-action="${option.id}"]`);
//     if (checkbox && checkbox.checked) {
//       console.log("Applying option:", option.label);   
//       option.action(doc);
//     }
//   });

//   output.value = doc.body.innerHTML;
// });

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
