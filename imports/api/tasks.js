import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Tasks = new Mongo.Collection('tasks');
export const UserVote = new Mongo.Collection('uservote');

    if (Meteor.isServer) {
          // This code only runs on the server
           Meteor.startup(function(){
            Meteor.publish('tasks', function(skipCount, limit) {
              return Tasks.find({},{sort: { createdAt: -1 }, limit:limit,skip:skipCount});
            });
            Meteor.publish('userVotes', function() {
              return UserVote.find({});
            });

          })


        }


    Meteor.methods({
      'tasks.insert'(title, url) {
        check(title, String);
        check(url, String);

        // Make sure the user is logged in before inserting a task
        if (! this.userId) {
          throw new Meteor.Error('not-authorized');
        }


        Tasks.insert({
          text: title,
          url: "http://"+url,
          createdAt: new Date(),
          voteCount: 0,
          owner: this.userId,
          username: Meteor.users.findOne(this.userId).username,
        });
      },
      'tasks.remove'(taskId) {
        check(taskId, String);

        const task = Tasks.findOne(taskId);
        if (task.owner !== this.userId) {
          // If the task is private, make sure only the owner can delete it
          throw new Meteor.Error('not-authorized');
        }

        Tasks.remove(taskId);
      },
      'tasks.update'(taskId, taskText){
        check(taskText, String);
        check(taskId, String);

        const task = Tasks.findOne(taskId);
        Tasks.update({_id: taskId},{$set: {text: taskText, createdAt: new Date()}})
      },
      'tasks.voteCountUpdate'(taskId){

        check(taskId,String);
        const task = Tasks.findOne(taskId);
        UserVote.insert({
          userId: this.userId,
          text: task.text
        })
        Tasks.update({_id: taskId},{$set: {voteCount: (task.voteCount)+1}})
      },
      'tasks.unVote'(taskId){
        check(taskId,String);
        const task = Tasks.findOne(taskId);
        Tasks.update({_id: taskId},{$set: {voteCount: (task.voteCount)-1}})
        UserVote.remove({text: task.text})
      },
      'getUrlTitle'(url){
        var url = "http://textance.herokuapp.com/title/"+url;
        return Meteor.http.call("GET", url);
      }


    });
