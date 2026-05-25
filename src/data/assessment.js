export const defaultAssessmentId = "five-dim";

export const answerOptions = [
  { value: 1, label: "非常不符合" },
  { value: 2, label: "不太符合" },
  { value: 3, label: "一般" },
  { value: 4, label: "比较符合" },
  { value: 5, label: "非常符合" },
];

const fiveDimTraitOrder = ["openness", "discipline", "social", "empathy", "resilience"];
const discTraitOrder = ["dominance", "influence", "steadiness", "conscientiousness"];

const fiveDimTraits = {
  openness: {
    name: "开放探索",
    short: "探索",
    description: "面对新想法、未知领域和变化时的好奇度与接受度。",
    insight: "这一维度关注你的好奇心、创新意识与对未知的探索倾向。",
    high: "你容易从变化和新信息中获得能量，适合保留探索空间，让灵感变成可执行的小实验。",
    low: "你更重视熟悉和确定性，可以用低风险尝试拓宽选择，例如每周接触一个新观点或新方法。",
    colorVar: "--trait-openness",
  },
  discipline: {
    name: "稳定执行",
    short: "执行",
    description: "组织任务、保持节奏、兑现计划的倾向。",
    insight: "这一维度关注你的计划感、自我管理和持续推进能力。",
    high: "你擅长把目标拆成步骤，适合承担需要持续推进的任务，同时留意不要让计划压缩恢复时间。",
    low: "你可能更依赖情境和兴趣驱动，可以用更短的任务清单、固定提醒和可见进度降低启动成本。",
    colorVar: "--trait-discipline",
  },
  social: {
    name: "社交能量",
    short: "社交",
    description: "从互动、表达和外部反馈中获得能量的程度。",
    insight: "这一维度关注你在交流、表达和群体互动中的能量变化。",
    high: "你通常在交流中更快进入状态，适合用讨论、演示或协作来激活想法。",
    low: "你可能更需要独处来恢复和思考，适合提前安排安静时间，并用书面方式表达复杂观点。",
    colorVar: "--trait-social",
  },
  empathy: {
    name: "协作同理",
    short: "同理",
    description: "理解他人处境、协调关系和维护合作氛围的倾向。",
    insight: "这一维度关注你如何感知他人需求、处理冲突和维持合作。",
    high: "你容易关注他人的感受和合作体验，适合在关系中同时练习清晰边界和直接表达。",
    low: "你可能更看重效率和原则，可以在关键沟通前主动确认对方关切，减少误解成本。",
    colorVar: "--trait-empathy",
  },
  resilience: {
    name: "情绪韧性",
    short: "韧性",
    description: "在压力、不确定和挫折中保持稳定与恢复的能力。",
    insight: "这一维度关注你面对压力时的稳定度、恢复速度和调节能力。",
    high: "你面对压力时相对稳定，适合承担节奏变化较大的事务，也要持续维护睡眠和休息。",
    low: "你对压力信号较敏感，可以把恢复机制前置，例如暂停、记录触发点、寻求支持或拆小任务。",
    colorVar: "--trait-resilience",
  },
};

const discTraits = {
  dominance: {
    name: "D 主导型",
    short: "D",
    description: "面对目标、推进和决策时，更偏直接、果断和结果导向的风格。",
    insight: "这一维度关注你在推进目标、做决定和面对阻力时的主导倾向。",
    high: "你在推进任务时更愿意直面问题、快速拍板，适合承担需要开局和破局的场景，同时留意倾听和节奏。",
    low: "你通常不会优先使用强推进方式，适合在关键节点提前表态，避免好想法因为过度观望而失速。",
    colorVar: "--trait-dominance",
  },
  influence: {
    name: "I 影响型",
    short: "I",
    description: "在表达、感染和建立联系时，更偏外向、热情和带动氛围的风格。",
    insight: "这一维度关注你在表达想法、建立关系和调动气氛时的影响倾向。",
    high: "你容易通过表达、互动和情绪感染带动局面，适合承担破冰、说明和对外沟通角色，同时留意落地细节。",
    low: "你不一定依赖高频表达来推动事情，适合在重要场合提前准备一句核心观点，提高存在感和推动力。",
    colorVar: "--trait-influence",
  },
  steadiness: {
    name: "S 稳定型",
    short: "S",
    description: "在合作、节奏和支持他人时，更偏耐心、稳定和持续配合的风格。",
    insight: "这一维度关注你在配合、支持和面对节奏变化时的稳定倾向。",
    high: "你在团队中更容易保持耐心和持续支持，适合承担协同与跟进角色，同时注意别长期压住自己的节奏需求。",
    low: "你更习惯变化、速度或独立推进，适合在合作中主动说明自己的节奏偏好，减少他人误判。",
    colorVar: "--trait-steadiness",
  },
  conscientiousness: {
    name: "C 谨慎型",
    short: "C",
    description: "在标准、分析和质量控制时，更偏严谨、审慎和看重准确度的风格。",
    insight: "这一维度关注你在核对信息、制定标准和确保质量时的谨慎倾向。",
    high: "你通常会先核对、比较和思考边界，适合承担分析、审查和质量把关角色，同时留意避免迟迟不决。",
    low: "你不一定把严谨核对放在第一位，适合给高风险决策设置最小检查清单，减少返工成本。",
    colorVar: "--trait-conscientiousness",
  },
};

const fiveDimDefaultQuestions = [
  { id: "q1", text: "我愿意尝试不熟悉的方法，即使它一开始不够确定。", trait: "openness", reverse: false },
  { id: "q2", text: "相比探索新选择，我更倾向于沿用已经验证过的做法。", trait: "openness", reverse: true },
  { id: "q3", text: "遇到复杂问题时，我会主动寻找不同角度的解释。", trait: "openness", reverse: false },
  { id: "q4", text: "如果没有明确收益，我通常不会花时间接触新领域。", trait: "openness", reverse: true },
  { id: "q5", text: "我会把重要事情拆成步骤，并持续跟进完成情况。", trait: "discipline", reverse: false },
  { id: "q6", text: "我经常到最后一刻才开始处理重要任务。", trait: "discipline", reverse: true },
  { id: "q7", text: "即使没有外部监督，我也能保持基本节奏。", trait: "discipline", reverse: false },
  { id: "q8", text: "计划变化时，我很容易失去继续推进的动力。", trait: "discipline", reverse: true },
  { id: "q9", text: "和别人交流后，我通常会更有精神。", trait: "social", reverse: false },
  { id: "q10", text: "在多人场合中，我常常希望尽快回到安静环境。", trait: "social", reverse: true },
  { id: "q11", text: "我愿意主动表达自己的想法，并推动讨论继续。", trait: "social", reverse: false },
  { id: "q12", text: "需要频繁社交的日程会让我明显消耗。", trait: "social", reverse: true },
  { id: "q13", text: "做决定时，我会认真考虑它对他人的影响。", trait: "empathy", reverse: false },
  { id: "q14", text: "当目标明确时，我不太会被他人的感受影响。", trait: "empathy", reverse: true },
  { id: "q15", text: "冲突出现时，我会尝试理解双方真正关心的问题。", trait: "empathy", reverse: false },
  { id: "q16", text: "我更喜欢直接指出问题，而不是照顾表达方式。", trait: "empathy", reverse: true },
  { id: "q17", text: "压力增加时，我通常还能保持相对清晰的判断。", trait: "resilience", reverse: false },
  { id: "q18", text: "小挫折有时会明显影响我一整天的状态。", trait: "resilience", reverse: true },
  { id: "q19", text: "遇到不顺利时，我能较快恢复并重新安排下一步。", trait: "resilience", reverse: false },
  { id: "q20", text: "面对不确定情况，我容易反复担心最坏结果。", trait: "resilience", reverse: true },
];

const fiveDimExtraQuestions = [
  { id: "q21", text: "面对一个全新的主题时，我通常会主动去补充背景知识。", trait: "openness", reverse: false },
  { id: "q22", text: "如果一件事暂时没有成熟范例，我往往不太愿意先尝试。", trait: "openness", reverse: true },
  { id: "q23", text: "我会把陌生领域当作扩展视野的机会，而不只是风险。", trait: "openness", reverse: false },
  { id: "q24", text: "相比研究新方法，我更愿意重复自己已经熟练的路径。", trait: "openness", reverse: true },
  { id: "q25", text: "我通常会提前安排关键任务的时间和顺序。", trait: "discipline", reverse: false },
  { id: "q26", text: "只要没有明确截止时间，我很容易把事情一拖再拖。", trait: "discipline", reverse: true },
  { id: "q27", text: "即使状态一般，我也能按既定步骤把事情推进下去。", trait: "discipline", reverse: false },
  { id: "q28", text: "只要当天节奏被打乱，我常会连带放弃原来的计划。", trait: "discipline", reverse: true },
  { id: "q29", text: "在讨论里，我通常愿意先开口把氛围带起来。", trait: "social", reverse: false },
  { id: "q30", text: "连续几场社交活动之后，我往往需要明显的独处时间。", trait: "social", reverse: true },
  { id: "q31", text: "需要认识新朋友或新同事时，我通常不太抗拒。", trait: "social", reverse: false },
  { id: "q32", text: "如果一个活动主要是寒暄互动，我通常不会太期待参加。", trait: "social", reverse: true },
  { id: "q33", text: "在合作中，我会留意别人没有直接说出口的顾虑。", trait: "empathy", reverse: false },
  { id: "q34", text: "只要事情能完成，我通常不会太在意过程中谁感受如何。", trait: "empathy", reverse: true },
  { id: "q35", text: "当别人表达不满时，我会先尝试理解背后的原因。", trait: "empathy", reverse: false },
  { id: "q36", text: "遇到分歧时，我常会先强调结论，而不是先确认彼此理解。", trait: "empathy", reverse: true },
  { id: "q37", text: "出现突发状况时，我通常能先稳住自己再处理问题。", trait: "resilience", reverse: false },
  { id: "q38", text: "一旦事情偏离预期，我常会在脑中反复回想很久。", trait: "resilience", reverse: true },
  { id: "q39", text: "即使经历一次失误，我也能较快恢复正常节奏。", trait: "resilience", reverse: false },
  { id: "q40", text: "不确定因素一多，我的注意力就容易被担忧分散。", trait: "resilience", reverse: true },
];

const discDefaultQuestions = [
  { id: "disc-q1", text: "遇到需要推进结果的局面时，我通常会直接表态并推动下一步。", trait: "dominance", reverse: false },
  { id: "disc-q2", text: "即使方向已经清楚，我也更愿意等别人先做决定。", trait: "dominance", reverse: true },
  { id: "disc-q3", text: "当讨论拖得太久时，我会主动把话题拉回结论。", trait: "dominance", reverse: false },
  { id: "disc-q4", text: "面对明显分歧时，我通常会避免正面推进。", trait: "dominance", reverse: true },
  { id: "disc-q5", text: "我愿意主动打开话题，让陌生人更快进入交流状态。", trait: "influence", reverse: false },
  { id: "disc-q6", text: "在公开表达想法前，我常常会犹豫很久。", trait: "influence", reverse: true },
  { id: "disc-q7", text: "如果团队气氛沉闷，我通常会自然地去活跃它。", trait: "influence", reverse: false },
  { id: "disc-q8", text: "比起当场表达，我更愿意把想法留到私下再说。", trait: "influence", reverse: true },
  { id: "disc-q9", text: "即使任务重复或周期较长，我也能保持稳定配合。", trait: "steadiness", reverse: false },
  { id: "disc-q10", text: "计划一旦变化频繁，我会明显失去耐心。", trait: "steadiness", reverse: true },
  { id: "disc-q11", text: "在团队协作里，我通常愿意先支持整体节奏。", trait: "steadiness", reverse: false },
  { id: "disc-q12", text: "只要节奏一慢下来，我就很难继续耐心等待。", trait: "steadiness", reverse: true },
  { id: "disc-q13", text: "做决定前，我会先确认信息是否完整、标准是否清楚。", trait: "conscientiousness", reverse: false },
  { id: "disc-q14", text: "只要大方向没问题，我通常不会花太多时间核对细节。", trait: "conscientiousness", reverse: true },
  { id: "disc-q15", text: "我会主动指出定义不清或规则不一致的地方。", trait: "conscientiousness", reverse: false },
  { id: "disc-q16", text: "相比准确无误，我更在意先把事情快速推进。", trait: "conscientiousness", reverse: true },
];

const discExtraQuestions = [
  { id: "disc-q17", text: "一旦判断目标明确，我会更愿意先推进再边走边修正。", trait: "dominance", reverse: false },
  { id: "disc-q18", text: "即使我知道怎么做，我也常把拍板机会让给别人。", trait: "dominance", reverse: true },
  { id: "disc-q19", text: "遇到阻力时，我通常会主动要求明确责任和时间点。", trait: "dominance", reverse: false },
  { id: "disc-q20", text: "出现拉扯时，我更倾向先退一步，避免把场面推得太硬。", trait: "dominance", reverse: true },
  { id: "disc-q21", text: "我通常能比较自然地把自己的想法讲得有感染力。", trait: "influence", reverse: false },
  { id: "disc-q22", text: "在不熟悉的人面前，我一般不会主动成为气氛中心。", trait: "influence", reverse: true },
  { id: "disc-q23", text: "需要争取支持时，我愿意用故事和情绪把人带入情境。", trait: "influence", reverse: false },
  { id: "disc-q24", text: "相比现场说服别人，我更偏好先整理好文字再表达。", trait: "influence", reverse: true },
  { id: "disc-q25", text: "只要团队需要，我通常能长期维持稳定而耐心的配合。", trait: "steadiness", reverse: false },
  { id: "disc-q26", text: "当别人反复改需求时，我通常很难继续平稳配合。", trait: "steadiness", reverse: true },
  { id: "disc-q27", text: "在合作中，我愿意照顾整体节奏，而不是只追求自己的速度。", trait: "steadiness", reverse: false },
  { id: "disc-q28", text: "如果流程推进得太慢，我往往会迅速失去继续配合的耐心。", trait: "steadiness", reverse: true },
  { id: "disc-q29", text: "处理重要任务时，我会先确认标准、边界和例外情况。", trait: "conscientiousness", reverse: false },
  { id: "disc-q30", text: "只要整体方向没跑偏，细节上的不严密通常不会让我停下来。", trait: "conscientiousness", reverse: true },
  { id: "disc-q31", text: "我更习惯在行动前先核对关键数据和定义。", trait: "conscientiousness", reverse: false },
  { id: "disc-q32", text: "赶时间时，我通常愿意先上线或先推进，再回头补检查。", trait: "conscientiousness", reverse: true },
];

function shuffle(items, random = Math.random) {
  const list = [...items];

  for (let index = list.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];
  }

  return list;
}

function sample(items, count, random = Math.random) {
  return shuffle(items, random).slice(0, count);
}

function buildQuestionIndex(questions) {
  return new Map(questions.map((question) => [question.id, question]));
}

function getQuestionCountByTraitFromList(traitOrder, questions) {
  return traitOrder.reduce((counts, traitKey) => {
    counts[traitKey] = questions.filter((question) => question.trait === traitKey).length;
    return counts;
  }, {});
}

const assessments = {
  "five-dim": {
    id: "five-dim",
    name: "五维人格探索",
    brandSubtitle: "五维自我探索",
    introTitle: "五维人格探索，从一个本地档案开始",
    introDescription:
      "选择当前用户与评估方法后开始答题。系统会从更大的题库中随机抽取一组题目，答案、进度和结果只保存在这台设备的浏览器中。",
    introOverviewLabel: "五维概览",
    resultTitle: "你的五维人格画像",
    resultContext:
      "本测评每个维度会从题库中随机抽取 4 道题，适合做自我探索和复盘；分数接近中段时代表倾向不明显，不建议过度解读。",
    reportTitle: "人格评估报告",
    reportScoresTitle: "五维结果",
    answerReviewTitle: "答案回看",
    estimatedTime: "预计 5-8 分钟",
    progressSummary: "每次会随机抽取一组题目，所有答案仅保存在当前浏览器。",
    radarLabel: "五维人格雷达图",
    topLabel: "最高维度",
    lowLabel: "可发展维度",
    neutralPatternTitle: "五维观察型",
    traitOrder: fiveDimTraitOrder,
    traits: fiveDimTraits,
    questions: fiveDimDefaultQuestions,
    questionPool: [...fiveDimDefaultQuestions, ...fiveDimExtraQuestions],
    defaultQuestionIds: fiveDimDefaultQuestions.map((question) => question.id),
    questionsPerTrait: 4,
    reverseQuestionsPerTrait: 2,
    summaryPatterns: {
      "openness:discipline": {
        title: "探索落地型",
        text: "你很容易被新想法和未知领域激发，但稳定执行相对保守。适合把探索拆成更短的验证周期，用小实验把灵感落地。",
      },
      "empathy:resilience": {
        title: "共情边界型",
        text: "你对他人处境和合作氛围很敏感，但压力恢复需要更多空间。适合在照顾关系的同时提前设定边界和恢复机制。",
      },
      "discipline:openness": {
        title: "秩序拓展型",
        text: "你擅长持续推进和维持秩序，但面对新方向时可能更谨慎。适合在稳定计划中保留少量探索预算。",
      },
      "social:resilience": {
        title: "表达恢复型",
        text: "你能从交流中获得能量，但压力恢复可能需要额外照顾。适合把密集社交和安静恢复安排成清晰节奏。",
      },
      "resilience:empathy": {
        title: "稳态直行型",
        text: "你在压力中相对稳定，但协作同理维度较保守。适合在推进目标时主动确认他人的关切，减少沟通摩擦。",
      },
      "openness:social": {
        title: "探索内敛型",
        text: "你对新想法和未知领域有天然好奇，但社交场合未必能给你充电。适合用独处或小范围交流来深入探索，再把成果以书面或结构化方式输出。",
      },
      "openness:empathy": {
        title: "直觉探路型",
        text: "你更关注想法本身的吸引力，对他人情绪信号的关注相对较少。适合在创新类工作中发力，同时在关键协作节点主动确认对方需求。",
      },
      "openness:resilience": {
        title: "灵感敏感型",
        text: "你的探索动力很强，但面对压力和不确定时恢复可能较慢。适合在安全边界内大胆尝试，并为高强度阶段预留恢复资源。",
      },
      "discipline:social": {
        title: "秩序内驱型",
        text: "你擅长自我管理和持续推进，但频繁社交可能消耗你的精力。适合承担需要独立深度工作的任务，用异步沟通替代大部分实时会议。",
      },
      "discipline:empathy": {
        title: "效率执行型",
        text: "你对任务节奏和完成度有清晰标准，但可能不太优先考虑他人感受。适合在目标驱动的环境中发挥作用，同时在团队协作时多留意合作体验。",
      },
      "discipline:resilience": {
        title: "计划缓冲型",
        text: "你的执行力稳定，但计划被打乱时恢复成本较高。适合在计划中预留弹性缓冲，并建立应对突发情况的快速复位流程。",
      },
      "social:openness": {
        title: "交流激活型",
        text: "你能从互动和表达中获得能量，但面对全新方向时可能更谨慎。适合用讨论和协作激发想法，再结合验证步骤稳步推进。",
      },
      "social:discipline": {
        title: "即兴协作型",
        text: "你在社交和表达中更有活力，但长期独自执行可能缺少动力。适合用同伴协作、定期同步和公开承诺来保持节奏。",
      },
      "social:empathy": {
        title: "能量输出型",
        text: "你在互动中充满能量和表达欲，但有时可能忽略对方的情绪节奏。适合在需要活跃氛围的场景中发挥，同时练习倾听和暂停回应。",
      },
      "empathy:openness": {
        title: "关系守成型",
        text: "你非常关注他人的感受和合作体验，但面对全新方向时可能更偏向稳妥。适合在关系维护和团队协调中发挥优势，用小范围试点来逐步拓展。",
      },
      "empathy:discipline": {
        title: "共情调和型",
        text: "你善于感知他人需求和维持和谐氛围，但持续推进计划时可能更依赖情境。适合用关系驱动的方式推进目标，同时借助外部工具补充节奏管理。",
      },
      "empathy:social": {
        title: "倾听支持型",
        text: "你能敏锐察觉他人的情绪和需求，但大规模社交可能不是你的能量来源。适合一对一深度支持或小团队协作，用书面表达补充高频社交。",
      },
      "resilience:openness": {
        title: "稳健保守型",
        text: "你在压力下能保持稳定，但对新方向可能更谨慎。适合承担需要抗压的关键任务，同时在低风险场景中尝试新方法来拓宽选择面。",
      },
      "resilience:discipline": {
        title: "弹性自驱型",
        text: "你面对压力时恢复较快，但长期维持固定节奏可能不是你的强项。适合用灵活的方式推进目标，关键节点设提醒而非依赖自律。",
      },
      "resilience:social": {
        title: "独立恢复型",
        text: "你在压力中相对稳定，但社交互动未必能快速补充你的能量。适合独立承担高压任务，用可控的社交节奏来平衡工作和生活。",
      },
    },
    buildSummaryText({ top, low, topBand, lowBand, pattern }) {
      if (pattern) {
        return `${pattern.text}你的最高维度是“${top.name}”，最低维度是“${low.name}”，这个组合更适合作为行动线索，而不是固定标签。`;
      }

      if (topBand.id === "balanced" && lowBand.id === "balanced") {
        return "你的五维结果整体集中在中段，说明当前画像更像情境型：不同任务、关系和压力状态下可能呈现不同侧面。";
      }

      return `你的当前画像以“${top.name}”最突出，属于“${topBand.label}”；“${low.name}”相对保守，属于“${lowBand.label}”。这些结果更适合作为自我观察线索，而不是固定标签。`;
    },
  },
  disc: {
    id: "disc",
    name: "DISC 行为风格",
    brandSubtitle: "DISC 行为风格",
    introTitle: "DISC 行为风格，从一个本地档案开始",
    introDescription:
      "选择当前用户与评估方法后开始答题。系统会从更大的题库中随机抽取一组题目，DISC 更关注你在沟通、推进、配合和质量控制中的外显行为风格。",
    introOverviewLabel: "DISC 四维概览",
    resultTitle: "你的 DISC 行为风格画像",
    resultContext:
      "DISC 每个维度会从题库中随机抽取 4 道题，更关注你在沟通、推进、配合和审慎程度上的常用风格。分数体现当前更常使用的行为方式，不等同于固定人格或临床结论。",
    reportTitle: "DISC 行为风格报告",
    reportScoresTitle: "DISC 四维结果",
    answerReviewTitle: "答案回看",
    estimatedTime: "预计 4-6 分钟",
    progressSummary: "每次会随机抽取一组题目，结果只在本地计算。",
    radarLabel: "DISC 四维雷达图",
    topLabel: "最常用风格",
    lowLabel: "较少使用风格",
    neutralPatternTitle: "DISC 平衡型",
    traitOrder: discTraitOrder,
    traits: discTraits,
    questions: discDefaultQuestions,
    questionPool: [...discDefaultQuestions, ...discExtraQuestions],
    defaultQuestionIds: discDefaultQuestions.map((question) => question.id),
    questionsPerTrait: 4,
    reverseQuestionsPerTrait: 2,
    summaryPatterns: {
      "dominance:steadiness": {
        title: "推进突破型",
        text: "你更容易优先推动结果、缩短等待时间，在需要开局、破局或明确方向的场景里更容易出手。",
      },
      "influence:conscientiousness": {
        title: "表达带动型",
        text: "你更容易通过表达和互动带动人，也更愿意先把局面推动起来，再逐步补齐细节和规则。",
      },
      "steadiness:dominance": {
        title: "稳定支持型",
        text: "你更重视节奏稳定、配合感和长期支持，通常不会用强推进方式主导局面，而是先把协作关系维持住。",
      },
      "conscientiousness:influence": {
        title: "审慎分析型",
        text: "你更在意准确、标准和判断质量，倾向先确认信息和边界，再决定怎么表达和推进。",
      },
    },
    buildSummaryText({ top, low, topBand, lowBand, pattern }) {
      if (pattern) {
        return `${pattern.text}当前最常使用的是“${top.name}”，较少使用的是“${low.name}”。这更像你在多数场景下的默认工作方式，而不是固定身份标签。`;
      }

      if (topBand.id === "balanced" && lowBand.id === "balanced") {
        return "你的 DISC 四维结果整体集中在中段，说明你会根据场景切换行为风格，没有特别单一的默认模式。";
      }

      return `你当前更常使用“${top.name}”风格，属于“${topBand.label}”；“${low.name}”相对少用，属于“${lowBand.label}”。这能帮助你识别自己在推进、表达、配合和审慎上的默认偏好。`;
    },
  },
};

const questionIndexByAssessment = Object.fromEntries(
  Object.values(assessments).map((assessment) => [assessment.id, buildQuestionIndex(assessment.questionPool)]),
);

function getExpectedQuestionCount(assessment) {
  return assessment.questionsPerTrait * assessment.traitOrder.length;
}

function normalizeQuestionIdsInternal(assessment, questionIds) {
  if (!Array.isArray(questionIds)) return assessment.defaultQuestionIds;

  const questionIndex = questionIndexByAssessment[assessment.id];
  const uniqueIds = [...new Set(questionIds)].filter((questionId) => questionIndex.has(questionId));

  if (uniqueIds.length !== getExpectedQuestionCount(assessment)) return assessment.defaultQuestionIds;

  const selectedQuestions = uniqueIds.map((questionId) => questionIndex.get(questionId));
  const countByTrait = getQuestionCountByTraitFromList(assessment.traitOrder, selectedQuestions);
  const reverseCountByTrait = assessment.traitOrder.reduce((counts, traitKey) => {
    counts[traitKey] = selectedQuestions.filter((question) => question.trait === traitKey && question.reverse).length;
    return counts;
  }, {});

  const isBalanced = assessment.traitOrder.every(
    (traitKey) =>
      countByTrait[traitKey] === assessment.questionsPerTrait &&
      reverseCountByTrait[traitKey] === assessment.reverseQuestionsPerTrait,
  );

  return isBalanced ? uniqueIds : assessment.defaultQuestionIds;
}

export const assessmentList = Object.values(assessments);
export const assessmentOptions = assessmentList.map((assessment) => ({
  id: assessment.id,
  name: assessment.name,
  description: assessment.introDescription,
}));

export function getAssessmentDefinition(assessmentId = defaultAssessmentId) {
  return assessments[assessmentId] ?? assessments[defaultAssessmentId];
}

export function getDefaultQuestionIds(assessmentId = defaultAssessmentId) {
  return [...getAssessmentDefinition(assessmentId).defaultQuestionIds];
}

export function createQuestionSetIds(assessmentId = defaultAssessmentId, random = Math.random) {
  const assessment = getAssessmentDefinition(assessmentId);
  const positiveCount = assessment.questionsPerTrait - assessment.reverseQuestionsPerTrait;

  return assessment.traitOrder.flatMap((traitKey) => {
    const traitQuestions = assessment.questionPool.filter((question) => question.trait === traitKey);
    const positiveQuestions = traitQuestions.filter((question) => !question.reverse);
    const reverseQuestions = traitQuestions.filter((question) => question.reverse);
    const selected = [
      ...sample(positiveQuestions, positiveCount, random),
      ...sample(reverseQuestions, assessment.reverseQuestionsPerTrait, random),
    ];

    return shuffle(selected, random).map((question) => question.id);
  });
}

export function normalizeQuestionIds(assessmentId = defaultAssessmentId, questionIds) {
  return normalizeQuestionIdsInternal(getAssessmentDefinition(assessmentId), questionIds);
}

export function buildAssessmentSession(assessmentOrId, questionIds) {
  const baseAssessment =
    typeof assessmentOrId === "string" ? getAssessmentDefinition(assessmentOrId) : getAssessmentDefinition(assessmentOrId?.id);
  const normalizedQuestionIds = normalizeQuestionIdsInternal(baseAssessment, questionIds);
  const questionIndex = questionIndexByAssessment[baseAssessment.id];
  const questions = normalizedQuestionIds.map((questionId) => questionIndex.get(questionId));

  return {
    ...baseAssessment,
    questions,
    questionIds: normalizedQuestionIds,
  };
}

export function getQuestionCountByTrait(assessment) {
  return getQuestionCountByTraitFromList(assessment.traitOrder, assessment.questions);
}

export function getQuestionIdsForAssessment(assessmentId) {
  return new Set(getAssessmentDefinition(assessmentId).questionPool.map((question) => question.id));
}

export { assessments };
