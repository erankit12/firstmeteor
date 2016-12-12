import { Template } from 'meteor/templating';

import { Tasks } from '../api/tasks.js';

import './task.js';
import './body.html';



if(Meteor.isClient){
  Session.setDefault("skip", 0);
  Session.setDefault("limit", 2);
  Deps.autorun(function(){
    Meteor.subscribe("tasks", Session.get("skip"), Session.get("limit"));
    Meteor.subscribe("userVotes");
  });

  Template.body.events({
    'click .previous': function(){
      if(Session.get("skip")>=Session.get("limit")){
        Session.set('skip',Session.get('skip')-Session.get("limit"));
      }
    },
    'click .next': function(){
      Session.set('skip', Session.get('skip')+Session.get("limit"));
    },
  });

  Template.body.helpers({
              tasks() {
      return Tasks.find({}, { sort: { createdAt: -1 } });
    },


  });

  Template.body.events({
        'submit .new-task'(event) {
          // Prevent default browser form submit
          event.preventDefault();

          // Get value from form element
          const target = event.target;
          const text = target.text.value;

          // Insert a task into the collection
          const url = "http://textance.herokuapp.com/title/"+text;
          Meteor.http.call("GET",url,function(error,result){
            if(error){
              alert('Please enter valid Url');
            }
            else{
              console.log("result", result);
              Meteor.call('tasks.insert', result.content, text);
            }

            target.text.value = '';

          });
          //const title = Meteor.call('getUrlTitle', text);


          // Clear form

        },
      });
}
