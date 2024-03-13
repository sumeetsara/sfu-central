const request = require("supertest")
    , app = require("../app")

const path = require('path');    


describe("Login/Signup Page", function() {
    it("asks the user to login or signup to access app", function(done) {
        let pathForAuth = path.join(__dirname, "../");
        request(app).get("/").expect(200,done);
    });
}); 

describe("Home Page", function() {
    it("displays the home page to the user", function(done) {
        let pathForAuth = path.join(__dirname, "../");
        request(app).get("/home").expect(302,done);
    });
});

describe("Add Post Page", function() {
    it("displays the add post page", function(done) {
        let pathForAuth = path.join(__dirname, "../");
        request(app).get("/home").expect(302,done);
    });
});

describe("Friends Page", function() {
    it("displays friends page", function(done) {
        let pathForAuth = path.join(__dirname, "../");
        request(app).get("/friends").expect(302,done);
    });
});

describe("Courses Page", function() {
    it("displays courses page", function(done) {
        let pathForAuth = path.join(__dirname, "../");
        request(app).get("/courses").expect(302,done);
    });
});

describe("Add Course Page", function() {
    it("displays add course page", function(done) {
        let pathForAuth = path.join(__dirname, "../");
        request(app).get("/addCourse").expect(302,done);
    });
});
