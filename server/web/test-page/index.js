"use strict";

var pagesService = require("../../services/pages");
var testRepo = require("../../repositories/tests");
var commentsRepo = require("../../repositories/comments");


module.exports.register = function(server, options, next) {
  server.route({
    method: "GET",
    path: "/{slug}",
    handler: function(request, reply) {
      pagesService.getOneBySlug(request.params.slug, function(err, page) {
        if (err) {
          console.log("oneBySlug: ", err);
          return reply(err);
        }
        testRepo.getByPageId(page.id, function(err_, tests) {
          if (err_) {
            console.log("oneByPageId: ", err_);
            return reply(err_);
          }
          pagesService.getAllBySlug(request.params.slug, function(err__, revisions) {
            if (err__) {
              console.log("getAllBySlug: ", err__);
              return reply(err__);
            }
            commentsRepo.getAll("*", {pageID: page.id}, "published ASC", function(err___, comments) {
              if (err___) {
                console.log("getAll: ", err___);
                return reply(err___);
              }
              reply.view("test-page/index", {
                page: page,
                tests: tests,
                revisions: revisions,
                comments: comments
              });
            });
          });
        });
      });
    }
  });
  next();
};


exports.register.attributes = {
  name: "web/test-page"
};

