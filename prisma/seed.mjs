import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { id: "xingce-common-sense", subject: "行测", name: "常识判断", children: [] },
  { id: "xingce-language", subject: "行测", name: "言语理解与表达", children: ["逻辑填空", "片段阅读", "语句表达"] },
  { id: "xingce-quantity", subject: "行测", name: "数量关系", children: ["数学运算", "数字推理"] },
  { id: "xingce-reasoning", subject: "行测", name: "判断推理", children: ["图形推理", "定义判断", "类比推理", "逻辑判断"] },
  { id: "xingce-data", subject: "行测", name: "资料分析", children: ["增长率", "增长量", "比重", "平均数", "倍数"] },
  { id: "shenlun-summary", subject: "申论", name: "归纳概括", children: [] },
  { id: "shenlun-analysis", subject: "申论", name: "综合分析", children: [] },
  { id: "shenlun-solutions", subject: "申论", name: "提出对策", children: [] },
  { id: "shenlun-implementation", subject: "申论", name: "贯彻执行", children: [] },
  { id: "shenlun-essay", subject: "申论", name: "申发论述", children: [] },
];

async function main() {
  for (const [primaryIndex, category] of categories.entries()) {
    await prisma.primaryCategory.upsert({
      where: { subject_name: { subject: category.subject, name: category.name } },
      update: { sortOrder: primaryIndex, isActive: true },
      create: {
        id: category.id,
        subject: category.subject,
        name: category.name,
        sortOrder: primaryIndex,
      },
    });

    for (const [secondaryIndex, name] of category.children.entries()) {
      await prisma.secondaryCategory.upsert({
        where: {
          primaryCategoryId_name: {
            primaryCategoryId: category.id,
            name,
          },
        },
        update: { sortOrder: secondaryIndex, isActive: true },
        create: {
          id: `${category.id}-${secondaryIndex + 1}`,
          primaryCategoryId: category.id,
          name,
          sortOrder: secondaryIndex,
        },
      });
    }
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
