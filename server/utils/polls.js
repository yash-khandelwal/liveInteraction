class Polls {
  constructor() {
    this.polls = new Map();
    this.totalVotes = 0;
  }
  addPoll = ({ id, pollQuestion }) => {
    this.polls.set(id, pollQuestion);
    return this.polls.get(id);
  };
  /*
    pollQuestion: {
        id:
        user: {
            id:
            userName:
            displayName:
            channel:
            role:
        },
        question:
        options: [
            {
                option:
                votes:
            },
            {
                option:
                votes:
            }
            ...
        ]
    }
    */
  addVote = ({ id, optionNum }) => {
    this.polls.get(id).options[optionNum].votes += 1;
    this.totalVotes += 1;
  };
  updateVote = ({ id, prevOptionNum, newOptionNum }) => {
    this.polls.get(id).options[prevOptionNum].votes -= 1;
    this.polls.get(id).options[newOptionNum].votes += 1;
  };
  removePoll = ({ id }) => {
    this.polls.delete(id);
  };
  getPollResults = ({ id }) => {
    return this.polls.get(id);
  };
}

module.exports = Polls;
