// Keep post-login destinations inside the team registration flow.
export function getAuthRedirect(search: string): string {
  const redirect = new URLSearchParams(search).get("redirect");

  if (
    redirect === "/join-league" ||
    redirect?.startsWith("/join-league?") ||
    redirect?.startsWith("/join-league/")
  ) {
    return redirect;
  }

  return "/manager";
}
