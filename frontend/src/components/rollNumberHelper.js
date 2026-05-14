export const generateRollNumbers = (academicYear, branch, section) => {
  if (!academicYear || !branch || !section) return [];

  const year = academicYear.slice(-2);
  const branchMap =
  {
    CSE: "05",
    IT: "12",
    ECE: "04",
    CYS: "62",
    EEE: "02",
    CSM: "61",
    CSD: "67",
    AIML: "73",
    AIDS: "72",
  };

  const branchShortCode = branchMap[branch];

  if (!branchShortCode) return [];

  const baseRollNumber = `${year}B81A${branchShortCode}`;

  const sectionMap =
  {
    A: 1,
    B: 65,
    C: 129,
    D: 193,
    E: 257,
    F: 321,
    G: 385,
    H: 449,
    I: 513,
    J: 577,
  };

  const toAlphanumeric = (num) => {

    if(num<100) return String(num).padStart(2,"0");

    let index = num - 100;

    if(index<260)
    {
      let firstLetter = String.fromCharCode(65+Math.floor(index/10));
      let secondDigit = index%10;

      if (firstLetter>="I") firstLetter = String.fromCharCode(firstLetter.charCodeAt(0)+1);
      if (firstLetter>="O") firstLetter = String.fromCharCode(firstLetter.charCodeAt(0)+1);


      if(firstLetter<="Z") return `${firstLetter}${secondDigit}`;

    }

    index+=20
    index -= 260;

    let firstLetterIndex = Math.floor(index/24);
    let secondLetterIndex = index%24;

    firstLetterIndex += (firstLetterIndex >= 8) ? 1 : 0;
    firstLetterIndex += (firstLetterIndex >= 14) ? 1 : 0;

    secondLetterIndex += (secondLetterIndex >= 8) ? 1 : 0;
    secondLetterIndex += (secondLetterIndex >= 14) ? 1 : 0;

    return `${String.fromCharCode(65 + firstLetterIndex)}${String.fromCharCode(65 + secondLetterIndex)}`;
    
  };

  if (!(section in sectionMap)) return [];

  const sectionStart = sectionMap[section];

  let sectionRollNumbers = [];

  for (let i = sectionStart; i < sectionStart + 64; i++) {
    let rollNumberSuffix = toAlphanumeric(i);
    sectionRollNumbers.push(`${baseRollNumber}${rollNumberSuffix}`);
  }

  return sectionRollNumbers;
  
};