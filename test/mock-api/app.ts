import express from "express";
import router from "./routes";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", router);

// error handler
app.use(function (err: any, _req: any, res: any, _next: () => any) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = err;

	// render the error page
	res.status(err.status || 500);
	res.json({ error: err });
});

const port = 8080;
app.set("port", port);
app.listen(port, () => console.log("Server ready on port:", port));
