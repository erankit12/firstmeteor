import { Template } from 'meteor/templating';

import { Tasks } from '../api/tasks.js';
import { UserVote } from '../api/tasks.js';

import './task.html';

    Template.task.helpers({
      isOwner() {
        return this.owner === Meteor.userId();
      },
      isVoted(){
        const task = Tasks.findOne({_id:this._id});
        const userVote = UserVote.findOne({$and:[{text:task.text}, {userId:Meteor.userId()}]});

        if(userVote){
          return true;
        }
        else{
          return false;
        }

      }
      
});



    Template.task.events({
      'click .delete'() {
        Meteor.call('tasks.remove', this._id);
      },
      'change .text'(e, template){
        Meteor.call('tasks.update', this._id, e.target.value);
        template.$('input:text').blur();
        template.$('input:text').prop("readonly", true);
      },
      'click .edit-button'(e,template){
        template.$('input:text').focus();
        template.$('input:text').removeAttr("readonly");
      },
      'click .vote'(){
        Meteor.call('tasks.voteCountUpdate', this._id);
      },
      'click .unVote'(e, template){
        Meteor.call('tasks.unVote', this._id);
      }
    });
