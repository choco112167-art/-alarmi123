import { collectNotices } from "../lib/collect";

collectNotices()
  .then((results) => {
    console.log(JSON.stringify({ ok: true, results }, null, 2));
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
