export function getGreeting(name?: string, hour = new Date().getHours()): string {
  let salutation: string;

  if (hour < 12) {
    salutation = 'Good Morning';
  } else if (hour < 17) {
    salutation = 'Good Afternoon';
  } else {
    salutation = 'Good Evening';
  }

  return name ? `${salutation}, ${name}` : salutation;
}
