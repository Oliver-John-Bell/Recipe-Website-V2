function findCombinations(n) {
  const combinations = [];

  // Calculate n/3 rounded up
  const target = Math.ceil(n / 3);

  // Iterate through possible values for a
  for (let a = 0; a <= target; a++) {
    // Calculate remaining sum needed for b and c
    const remainingSum = target - a;

    // Iterate through possible values for b
    for (let b = 0; b <= remainingSum; b++) {
      // Calculate the value of c
      const c = remainingSum - b;

      // Ensure a, b, and c are not all equal to a non-zero value
      if ((a !== b || b !== c || c !== a) && a + b + c === target) {
        const equationResult = 20 * a + 30 * b + 40 * c + 5 * (a + b + c);

        // Check if the equation result matches the target
        if (equationResult === n) {
          combinations.push({ a, b, c });

          // Return if we found three combinations
          if (combinations.length === 3) return combinations;
        }
      }
    }
  }

  // If fewer than three combinations were found, duplicate the first combination
  while (combinations.length < 3) {
    combinations.push(combinations[0]);
  }

  return combinations;
}

// Example usage:
const n = 50; // Replace with your desired value of n
const result = findCombinations(n);
console.log(result);
