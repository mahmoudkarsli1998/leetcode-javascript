function twoSums(nums: number[], target: number): number[] {
    const map: Record<number, number> = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map[complement] !== undefined) {
            return [map[complement], i];
        }
        map[nums[i]] = i;
    }
    // assumption: one valid solution exists
    return [];
}
