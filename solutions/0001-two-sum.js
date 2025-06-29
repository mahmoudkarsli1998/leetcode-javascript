/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
/**
 * 📌 Pseudocode & Thinking Steps (English Academic):
 * 
 * 1. Initialize an empty HashMap `map` to store number → index.
 * 
 * 2. Loop over the array `nums` from index i = 0 to nums.length - 1:
 *    - Compute `complement = target - nums[i]`.
 * 
 * 3. Check if `complement` exists in `map`:
 *    - If yes: return [ map[complement], i ].
 *    - Else: store nums[i] in `map` with its index i.
 * 
 * ✅ Result: Find the solution in O(n) time instead of O(n^2) brute-force.
 * 
 * ✨ A clean and efficient solution using a single pass hash lookup.
 */
var twoSum = function(nums, target) {
    const map = new Map();
    
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        
        map.set(nums[i], i);
    }
    
    return [];
};

// Test cases
console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6)); // [1, 2]
console.log(twoSum([3, 3], 6)); // [0, 1]