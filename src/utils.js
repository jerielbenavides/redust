/**
 * @function: generateRandomPhrase
 * @description: generates random phrase that can be used to overwrite comments
 **/

export function generateRandomPhrase() {
  var verbs = [
    ["go to", "goes to", "going to", "went to", "gone to"],
    ["look at", "looks at", "looking at", "looked at", "looked at"],
    ["choose", "chooses", "choosing", "chose", "chosen"],
    ["talk about", "talks about", "talking about", "talked about", "talked about"],
    ["think about", "thinks about", "thinking about", "thought about", "thought about"],
    ["play with", "plays with", "playing with", "played with", "played with"],
    ["listen to", "listens to", "listening to", "listened to", "listened to"],
    ["make", "makes", "making", "made", "made"],
    ["find", "finds", "finding", "found", "found"],
    ["create", "creates", "creating", "created", "created"]
  ];
  var tenses = [
    {
      name: "Present",
      singular: 1,
      plural: 0,
      format: "%subject %verb %complement"
    },
    {
      name: "Past",
      singular: 3,
      plural: 3,
      format: "%subject %verb %complement"
    },
    {
      name: "Present Continuous",
      singular: 2,
      plural: 2,
      format: "%subject %be %verb %complement"
    }
  ];
  var subjects = [
    { name: "I", be: "am", singular: 0 },
    { name: "You", be: "are", singular: 0 },
    { name: "He", be: "is", singular: 1 },
    { name: "They", be: "are", singular: 0 },
    { name: "We", be: "are", singular: 0 }
  ];
  var complementsForVerbs = [
    ["cinema", "park", "home", "concert", "the beach"],
    ["for a map", "them", "the stars", "the lake", "the sunset"],
    ["a book for reading", "a DVD for tonight", "some music", "a recipe"],
    ["the news", "my thoughts", "the latest trends", "the weather"],
    ["the project", "a solution", "the problem", "an idea"],
    ["my toys", "the game", "the puzzle", "the instrument"],
    ["the radio", "some advice", "a story", "a podcast"],
    ["a decision", "a list", "some art", "a meal"],
    ["my keys", "the perfect gift", "the answer", "the way"],
    ["a new project", "a plan", "a strategy", "a masterpiece"]
  ];

  Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
  };

  function generate() {
    var index = Math.floor(verbs.length * Math.random());
    var tense = tenses.random();
    var subject = subjects.random();
    var verb = verbs[index];
    var complement = complementsForVerbs[index];
    var str = tense.format;
    str = str.replace("%subject", subject.name).replace("%be", subject.be);
    str = str.replace(
        "%verb",
        verb[subject.singular ? tense.singular : tense.plural]
    );
    str = str.replace("%complement", complement.random());

    // Append the notice about the Redust extension
    str += "\n * This comment was anonymized with the r/redust browser extension.";

    return str;
  }

  return generate();
}

/**
 * @function resolveAfter7Seconds: Simulates sleep() for 7 seconds and returns a promise.
 * to be used in conjunction with await.
 * Primary purpose is to respect reddit's API ratelimits
 */
export function resolveAfter7Seconds() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve("resolved");
    }, 7000); //Increased to 7 seconds. Non Oauth = 10 api calls per min.
  });
}

export function onNetworkError(error) {
  if (error.response) {
    // if error code is above 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    console.log(error.request);
  } else {
    console.log(
        "An Improper Request was sent to reddit.",
        error.message
    );
  }
  console.log(error);
}
