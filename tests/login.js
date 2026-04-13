import http from "k6/http";
import { check } from "k6";
import { SharedArray } from "k6/data";
import { Rate, Trend } from "k6/metrics";
import papaparse from "https://jslib.k6.io/papaparse/5.1.1/index.js";

const BASE_URL = "https://fakestoreapi.com";

const errorRate = new Rate("failed_requests");
const loginDuration = new Trend("login_duration");

const csvData = new SharedArray("users", function () {
  return papaparse.parse(open("./data/users.csv"), { header: true }).data;
});

export const options = {
  stages: [
    { duration: "10s", target: 10 },
    { duration: "20s", target: 25 },
    { duration: "30s", target: 25 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1500"],
    failed_requests: ["rate<0.03"],
  },
};

export default function () {
  const user = csvData[__VU % csvData.length];

  const payload = JSON.stringify({
    username: user.user,
    password: user.passwd,
  });

  const params = {
    headers: { "Content-Type": "application/json" },
    timeout: "60s",
  };

  const response = http.post(`${BASE_URL}/auth/login`, payload, params);

  loginDuration.add(response.timings.duration);

  const passed = check(response, {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
    "response time < 1500ms": (r) => r.timings.duration < 1500,
    "response has token": (r) => {
      try {
        return JSON.parse(r.body).token !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!passed);
}
