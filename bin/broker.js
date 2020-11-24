#!/usr/bin/env node

// 带有#!就是代表此文件可以当做脚本运行
// /usr/bin/env node这行的意思就是用node来执行此文件，node怎么来呢，就去用户(usr)的安装根目录(bin)下的env环境变量中去找

const program = require("commander");

const download = require("download-git-repo");

const handlebars = require("handlebars");

const inquirer = require("inquirer");

const fs = require("fs");

const ora = require("ora");

const chalk = require("chalk");
const logSymbols = require("log-symbols");

const templates = {
  "broker-tpl": {
    url: "https://github.com/dsfderek/vue-broker-template",
    description: "a模板",
    downloadUrl: "github:dsfderek/vue-broker-template#main",
  },
  "tpl-a": {
    url: "https://github.com/dsfderek/tpl-a",
    description: "a模板",
    downloadUrl: "github:dsfderek/tpl-a#main",
  },
  "tpl-b": {
    url: "https://github.com/dsfderek/tpl-b",
    description: "b模板",
    downloadUrl: "github:dsfderek/tpl-b#main",
  },
  "tpl-c": {
    url: "https://github.com/dsfderek/tpl-c",
    description: "c模板",
    downloadUrl: "github:dsfderek/tpl-c#main",
  },
};

program
  .version("0.1.0")
  .command("init <templateName> <projectName>")
  .description("初始化项目模板")
  .action((templateName, projectName) => {
    // 下载之前做loading 提示
    const spinner = ora("正在下载模板...").start();
    // 根据模板名下载对应的模板下载到本地
    // console.log(templateName, projectName);
    // console.log(templates[templateName]);
    // 第一个参数：仓库地址
    // 第二个参数：下载路径
    const { downloadUrl } = templates[templateName];
    console.log(downloadUrl, projectName);
    download(downloadUrl, projectName, { clone: true }, (err) => {
      if (err) {
        spinner.fail();
        console.log(logSymbols.error, chalk.red(err));
        return;
      }

      spinner.succeed();

      // 把项目下的package.json 文件读取出来
      // 使用用户向导的方式采集用户输入的值
      // 使用模板引擎把用户输入的数据解析到package.json 文件中
      // 解析完毕，把解析之后的结果重新写入package.json 文件中
      inquirer
        .prompt([
          {
            type: "input",
            name: "name",
            message: "请输入项目名称",
          },
          {
            type: "input",
            name: "description",
            message: "请输入项目简介",
          },
          {
            type: "input",
            name: "author",
            message: "请输入作者名称",
          },
        ])
        .then((answers) => {
          // 把采集到的用户输入的数据替换到package.json文件中
          // console.log(answers)
          const packagePath = `${projectName}/package.json`;
          const packageContent = fs.readFileSync(packagePath, "utf8");
          const packageResult = handlebars.compile(packageContent)(answers);
          fs.writeFileSync(packagePath, packageResult);
          console.log(logSymbols.success, chalk.green("初始化模板成功"));
        })
        .catch((error) => {
          if (error.isTtyError) {
            // Prompt couldn't be rendered in the current environment
          } else {
            // Something else went wrong
          }
        });
    });
  });
program
  .command("list")
  .description("查看所有可用模板")
  .action(() => {
    for (const key in templates) {
      if (templates.hasOwnProperty(key)) {
        console.log(`
${key} ${templates[key].description}模板
`);
      }
    }
  });

program.parse(process.argv);
