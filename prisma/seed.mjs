import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    id: "xingce-politics",
    subject: "行测",
    name: "政治理论",
    children: [
      ["xingce-politics-xi-theory", "习近平新时代中国特色社会主义思想"],
      ["xingce-politics-modernization", "中国式现代化"],
      ["xingce-politics-policy", "党和国家方针政策"],
      ["xingce-politics-documents", "重大会议与重要文件"],
      ["xingce-politics-current-affairs", "时事政治"],
      ["xingce-politics-party-history", "党史与党的基本理论"],
      ["xingce-politics-comprehensive", "政治理论综合"],
    ],
  },
  {
    id: "xingce-common-sense",
    subject: "行测",
    name: "常识判断",
    children: [],
  },
  {
    id: "xingce-language",
    subject: "行测",
    name: "言语理解与表达",
    children: [
      ["xingce-language-1", "逻辑填空"],
      ["xingce-language-2", "片段阅读"],
      ["xingce-language-3", "语句表达"],
    ],
  },
  {
    id: "xingce-quantity",
    subject: "行测",
    name: "数量关系",
    children: [
      ["xingce-quantity-1", "数学运算"],
      ["xingce-quantity-2", "数字推理"],
    ],
  },
  {
    id: "xingce-reasoning",
    subject: "行测",
    name: "判断推理",
    children: [
      ["xingce-reasoning-1", "图形推理"],
      ["xingce-reasoning-2", "定义判断"],
      ["xingce-reasoning-3", "类比推理"],
      ["xingce-reasoning-4", "逻辑判断"],
    ],
  },
  {
    id: "xingce-data",
    subject: "行测",
    name: "资料分析",
    children: [
      ["xingce-data-simple", "简单计算与直接查找"],
      ["xingce-data-current-value", "现期量"],
      ["xingce-data-base-value", "基期量"],
      ["xingce-data-2", "增长量"],
      ["xingce-data-1", "一般增长率"],
      ["xingce-data-interval-growth", "间隔增长率"],
      ["xingce-data-annual-growth", "年均增长率"],
      ["xingce-data-mixed-growth", "混合增长率"],
      ["xingce-data-contribution", "增长贡献率与拉动增长"],
      ["xingce-data-current-proportion", "现期比重"],
      ["xingce-data-base-proportion", "基期比重"],
      ["xingce-data-two-period-proportion", "两期比重"],
      ["xingce-data-current-average", "现期平均数"],
      ["xingce-data-base-average", "基期平均数"],
      ["xingce-data-average-growth", "平均数增长率"],
      ["xingce-data-5", "倍数与比值"],
      ["xingce-data-comparison", "大小比较与排序"],
      ["xingce-data-comprehensive", "综合分析"],
      ["xingce-data-other", "其他特殊题型"],
    ],
  },
  { id: "shenlun-summary", subject: "申论", name: "归纳概括", children: [] },
  { id: "shenlun-analysis", subject: "申论", name: "综合分析", children: [] },
  { id: "shenlun-solutions", subject: "申论", name: "提出对策", children: [] },
  { id: "shenlun-implementation", subject: "申论", name: "贯彻执行", children: [] },
  { id: "shenlun-essay", subject: "申论", name: "申发论述", children: [] },
];

const legacySecondaryCategories = [
  ["xingce-data-3", "比重（未细分）"],
  ["xingce-data-4", "平均数（未细分）"],
];

async function preserveOrRemoveLegacyCategories() {
  for (const [id, name] of legacySecondaryCategories) {
    const category = await prisma.secondaryCategory.findUnique({ where: { id } });
    if (!category) continue;

    const recordCount = await prisma.practiceRecord.count({
      where: { secondaryCategoryId: id },
    });

    if (recordCount === 0) {
      await prisma.secondaryCategory.delete({ where: { id } });
    } else {
      await prisma.secondaryCategory.update({
        where: { id },
        data: { name, isActive: false },
      });
    }
  }
}

async function main() {
  const subjectSortOrders = new Map();

  for (const category of categories) {
    const sortOrder = subjectSortOrders.get(category.subject) ?? 0;
    subjectSortOrders.set(category.subject, sortOrder + 1);

    await prisma.primaryCategory.upsert({
      where: { id: category.id },
      update: {
        subject: category.subject,
        name: category.name,
        sortOrder,
        isActive: true,
      },
      create: {
        id: category.id,
        subject: category.subject,
        name: category.name,
        sortOrder,
      },
    });

    for (const [secondaryIndex, [id, name]] of category.children.entries()) {
      await prisma.secondaryCategory.upsert({
        where: { id },
        update: {
          primaryCategoryId: category.id,
          name,
          sortOrder: secondaryIndex,
          isActive: true,
        },
        create: {
          id,
          primaryCategoryId: category.id,
          name,
          sortOrder: secondaryIndex,
        },
      });
    }
  }

  await preserveOrRemoveLegacyCategories();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
