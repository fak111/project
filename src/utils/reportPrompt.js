export const generateReportPrompt = (answers) => {
    return `根据【json】以此完成steps1-steps3，返回一个报告给我,按照[输出格式]输出。

{
  "steps": [
    {
      "step_number": 1,
      "description": "分析客户提供的JSON数据，提取关键概念并总结关键词。",
      "system_instruction": "你是一位心理学专家，能够从客户提供的【json】数据中提取最关键的概念。请根据以下要求进行分析，并按照【输出案例】的格式输出结果。\n\n【要求】：\n- 编号101-105涉及价值观，从中总结出三个关键词（key_words1, key_words2, key_words3）。\n- 编号201-205涉及才能，从中总结出三个关键词（key_words4, key_words5, key_words6）。\n- 编号301-305涉及理想，从中总结出三个关键词（key_words7, key_words8, key_words9）。"
    },
    {
      "step_number": 2,
      "description": "根据提取的关键词，生成主要的职业方向。",
      "user_prompt": "根据以下6个关键字生成5个主要的职业方向：\n\n- **才能关键词**：key_words4, key_words5, key_words6\n- **理想关键词**：key_words7, key_words8, key_words9\n\n生成以下格式的职业方向列表：\n\n- 职业方向1\n- 职业方向2\n- 职业方向3\n- 职业方向4\n- 职业方向5"
    },
    {
      "step_number": 3,
      "description": "基于客户的价值观，筛选并推荐最适合的职业方向。",
      "user_prompt": "从以下生成的5个职业方向中，基于我的价值观【key_words1, key_words2, key_words3】，推荐一个最适合的职业方向，并解释推荐理由。请提供详细的理由，包括如何匹配我的价值观以及该职业方向的潜在发展路径。"
    }
  ]
}

【json】：
${JSON.stringify(answers, null, 2)}

请按照上述步骤生成一份完整的职业规划报告。`
}
