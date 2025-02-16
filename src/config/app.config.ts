import express, {Request, Response, NextFunction} from "express"
import cors from "cors"
import fs from 'fs'
import axios from "axios";

const app = express()
app.use(express.json());
app.use(cors());

app.use('/integration', (req: Request, res: Response, next: NextFunction) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const data = {
        data: {
            descriptions: {
                app_name: "Uptimer",
                app_description: "Monitors website uptime",
                app_url: baseUrl,
                app_logo: "https://play-lh.googleusercontent.com/KierIVfm1zxqKpytzHcvK7Fxaox56OoZrj6rB_kbPXJr--oQgUZK_6uUCX1g8VEbE6lu",
                background_color: "#fff"
            },
            key_features: "Monitoring",
            integration_category: "interval",
            integration_type: "interval",
            settings: [
                { label: "site-1", type: "text", required: true, default: "https://www.facebook.com" },
                { label: "site-2", type: "text", required: true, default: "https://google.com" },
                { label: "interval", type: "text", required: true, default: "* * * * *" },
            ],
            tick_url: `${baseUrl}/tick`,
            target_url: "https://ping.telex.im/v1/webhooks/019506e5-4c43-756a-ab1f-06ab1d4ac61b"
        }
    }
    res.json(data)
})



async function checkSiteStatus(site: any) {
    try {
        const response = await axios.get(site, { timeout: 10000});
        if (response.status < 400) {
            return "Site is up and running fine";
        }
        return `${site} is down (status ${response.status})`;
    } catch (error: any) {
        return `${site} check failed: ${error.message}`;
    }
}

async function monitorTask(payload: any) {
    const sites = payload.settings.filter((s: { label: any; }) => s.label.startsWith("site")).map((s: { default: any; }) => s.default);
    // console.log(sites)
    const results = await Promise.all(sites.map(checkSiteStatus));

    const message = results.filter(result => result !== null).join("\n");

    const data = {
        message: message,
        username: "Uptime Monitor",
        event_name: "Uptime Check",
        status: "success"
    };

    await axios.post(payload.return_url, data, { headers: { "Content-Type": "application/json" } });
}

app.post("/tick", async (req, res) => {
    const payload = req.body;
    monitorTask(payload);
    res.status(202).json({ status: "accepted" });
});

export default app