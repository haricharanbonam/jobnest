function itemClicked(item) {
  console.log("Item clicked:", item.textContent);
  item.style.backgroundColor = "#90ee90";
}

function sumUpTo(n) {
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
    console.log(`Adding ${i}, current sum: ${sum}`);
  }
  return sum;
}
