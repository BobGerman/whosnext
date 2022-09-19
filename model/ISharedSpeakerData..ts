interface ISharedSpeakerData {
    speakers: [
      {
          name: string;
          order: number;
          timeAdded: Date;
          hasSpoken: boolean;
      }
    ],
    currentSpeakerOrder: number;
    speakerOrderOffset: number;
    timeWhosNextLastPushed: Date;   // Used to debounce the who's next button
  }
  
// Algorithm using this data structure:
//
//  - Add Me button 
//    - clean out speakers array (remove items if timeAdded > 24 hours ago)
//    - if array is empty, set currentSpeakerOrder to 0
//    - add the logged-in user to the speakers array, setting order to
//      speakerOrderOffset + random()
//    - write the data
//
//  - Who's Next button
//    - if timeWhosNextLastPushed is within the last n seconds, do nothing
//    - sort the array by order
//    - find the item after the current one
//    - set currentSpeakerOrder to the new item's order
//    - set timeWhosNextLastPushed to now
//    - write the data
//
//  - Shuffle button
//    - increment speakerOrderOffset so all sorted items will be greater
//      than the speakers who have already spoken
//    - for each array element where hasSpoken is false,
//        set order to speakerOrderOffset + random()
//        if this is the lowest speaker order we've looped through,
//           set current speaker order to this speaker's order
//    - write the data
//
//  - On new data
//    - sort speakers array by order
//    - show the array:
//        highlight the name of the speaker with order === currentSpeakerOrder
//        placing a check mark next to each speaker where hasSpoken is true
//    - if speakers were shown where hasSpoken is false,
//        enable the Who's next and shuffle buttons
//        hide the "meeting over" label
//      else
//        disable the Who's next and shuffle buttons
//        show the "meeting over" label

// This seems to handle all edge conditions I can think of including people
// adding themselves and shuffling in any order, and pushing all state to the
// Fluid Framework. The "Who's next" button is debounced in case more than one
// person presses it quickly and we skip a person (OR we could make a back button)






