require("dotenv").config();

const { App } = require("@slack/bolt");
const todos=[]
let nextId = 1
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

app.command("/manis-sidekick-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
});

app.command("/manis-sidekick-help", async ({ ack, respond }) => {
  await ack();
  await respond({
    text:
`Available Commands:
/manis-sidekick-ping - Check bot latency
/manis-sidekick-todo - creates a todo list`
  });
});

app.command("/manis-sidekick-todo",async({command,ack,respond})=>{
    await ack()
    const args = command.text.trim().split(/\s+/)
    const action = args.shift()?.toLowerCase()
    switch (action){
        case "add":{
            const task = args.join(" ").trim()
            if(!task){
                return respond(
                    "Usage: `/manis-sidekick-todo add <task>` Invalid parameter"
                );
            }
            const todo = {
                id:nextId++,
                user:command.user_id,
                task,
                completed:false
            }
            todos.push(todo)

            return respond({
                text:
                `✅ Todo Added
#${todo.id} ${todo.task}`
            })
        }
        case "list":{
            const userTodos = todos.filter(
                todo => todo.user === command.user_id
            )
            if(userTodos.length === 0){
                return respond("yayy YOU don't have todo's time to slack off")
            }
            const list = userTodos.map(todo =>
                `${todo.completed?"✅":"⬜"}${todo.id}. ${todo.task}`
            ).join("\n")
            return respond({
                text:
                `your todo-list
${list}`
            })
        
        }
        case "done":{
            const id = Number(args[0])
            if (!id){
                return respond(
                    "Usage: `/manis-sidekick-todo done <id>`"
                )
            }
            const todo = todos.find(
                t=> t.id === id&&t.user === command.user_id
            )
            if(!todo){
                return respond("Todo not found")
            }
            todo.completed = true
            return respond(`marked as done #${id}`)
        }
        case  "remove":{
            const id = Number(args[0])
            if(!id){
                return respond(
                    "Usage: `/manis-sidekick-todo remove <id>`"
                )
            }
            const index = todos.findIndex(
                t=> t.id === id && t.user ===command.user_id
            )
            if(index === -1){
                return respond("❌ Todo not found.");
            }
            const removed = todos.splice(index,1)[0]
            return respond(
                `Removed #${removed.id}:${removed.task}`
            )
        }
        default:
            return respond({
                text:
        `📝 Todo Commands

• /manis-sidekick-todo add <task>
• /manis-sidekick-todo list
• /manis-sidekick-todo done <id>
• /manis-sidekick-todo remove <id>`
});
    }
});


(async () => {
  await app.start();
  console.log("bot is running!");
})();