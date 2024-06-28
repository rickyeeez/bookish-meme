const express = require("express");
require("esm-hook"); // <--- add this to the top of your file.

const fetch = require("node-fetch").default;

const router = express.Router();
const Model = require("../model/model");
const Account = require("../model/account_model");

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

router.post("/post", (req, res) => {
  res.send("Post API");
});

router.get("/", async (req, res) => {
  try {
    const result = await Model.find();

    if (!result) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.json(result[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get(
  "/UkIZhiRxJBwbX5AAquEsc1VElMCYfPiiEluxdZ9a1Di7QYjk3OO6fsH3Q0M5uapo/gigih",
  async (req, res) => {
    try {
      const result = await Account.find().limit(150);

      if (!result) {
        return res.status(404).json({ message: "Data not found" });
      }

      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);
//Update by ID Method
router.get("/update/", async (req, res) => {
  try {
    const url = "https://api-sia.ut.ac.id/backend-sia/api/graphql";
    const query = `
    mutation {
      updateSession {
        access_token
      }
    }
  `;
    const token = await Model.find();
    const fetchoptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token[0]["token"]}`,
      },
      body: JSON.stringify({ query }),
    };
    const response = await fetch(url, fetchoptions);
    const data = await response.json();

    const updatedData = {
      token: data["data"]["updateSession"]["access_token"],
      last_update: Date.now(),
    };
    const options = { new: true };

    const result = await Model.findByIdAndUpdate(
      "6679126cbf41f457ded09a93",
      updatedData,
      options
    );

    res.send(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/wfid", async (req, res) => {
  try {
    const result = await Model.find(); // Assuming this fetches your authentication token or relevant data

    const url = "https://api-sia.ut.ac.id/backend-sia/api/graphql";

    // Generate a password if not provided in the request body
    let password = generateString(3).toUpperCase();
    if (req.body.password) {
      password = req.body.password;
    }

    const loginData = {
      nim: req.body.nim,
      password: password,
    };

    const account = await Account.findOne({
      username: loginData.nim.toString(),
    });
    if (account === null && req.body.internal === undefined) {
      res.send(
        {
          success: false,
          message: "Gagal ! NIM Tidak Ditemukan Pada Database",
        },
        500
      );
      return;
    }

    // Define the mutation query with variables
    const query = `
      mutation activateWifiId($data: CreateWifiIdInput!) {
        activateWifiId(payload: $data) {
          message
        }
      }
    `;

    const fetchoptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${result[0]["token"]}`, // Assuming result contains your authentication token
      },
      body: JSON.stringify({
        query: query,
        variables: {
          data: {
            nim: loginData.nim.toString(),
            password: loginData.password.toString(),
          },
        }, // Pass the inputData as an object with key 'data'
      }),
    };

    const response = await fetch(url, fetchoptions);
    const data = await response.json();
    if (data["errors"]) {
      res.send({
        success: false,
        message: "Gagal ! NIM Tidak Ditemukan / User Tidak Aktif",
      });
    } else {
      if (req.body.internal === undefined) {
        const updatedData = {
          password: loginData.password.toString(),
        };
        const options = { new: true };
        await Account.findByIdAndUpdate(account._id, updatedData, options);
      } else {
        if (account === null) {
          await Account.create({
            username: `${loginData.nim.toString()}`,
            password: loginData.password.toString(),
          });
        } else {
          const updatedData = {
            password: loginData.password.toString(),
          };
          const options = { new: true };
          await Account.findByIdAndUpdate(account._id, updatedData, options);
        }
      }

      res.send({
        success: true,
        message: {
          data: {
            username: `${loginData.nim.toString()}@ut.ac.id`,
            password: loginData.password.toString(),
          },
        },
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
module.exports = router;
