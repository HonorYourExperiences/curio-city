import { test, expect } from "@playwright/test";
test("offline evidence loop persists; bilingual discovery works on mobile", async ({
  page,
  request,
}) => {
  await request.delete("/api/passport?profileId=demo-explorer");
  await request.delete("/api/passport?profileId=demo-builder");
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Building things" }),
  ).toBeEnabled();
  await expect(page.locator(".journey-trail [aria-current=step]")).toHaveText(
    "Wonder",
  );
  await expect(page.locator(".creative-signature")).toContainText(
    "Made with Artistic Intelligence [AI]",
  );
  await page.screenshot({
    path: "/tmp/bydt-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Building things" }).click();
  await expect(
    page.getByRole("button", { name: "Let’s build!" }),
  ).toBeVisible();
  await expect(page.locator(".journey-trail [aria-current=step]")).toHaveText(
    "Try",
  );
  await page.screenshot({
    path: "/tmp/bydt-active.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("button", { name: "Keep going" }).click();
  await expect(
    page.getByText("Designers test their ideas with paper, too."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep going" }).click();
  await page.getByRole("button", { name: "Keep going" }).click();
  await page.getByRole("button", { name: "Try it offline" }).click();
  await expect(page.locator("#offline-mission")).toBeFocused();
  await page.getByRole("button", { name: "Let’s build!" }).click();
  await expect(
    page.getByText("Place two books a hand-width apart."),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Let’s build!" }).click();
  await expect(page.locator(".mission-summary")).toContainText(/19:|20:/);
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.getByRole("button", { name: "Log my build" }).click();
  await page
    .getByLabel("What did you change? What happened?")
    .fill("Folded paper held its shape.");
  await page.getByRole("button", { name: "Save to my passport" }).click();
  await expect(
    page.getByRole("button", { name: "View saved build" }),
  ).toBeVisible();
  await expect(page.locator(".journey-trail [aria-current=step]")).toHaveText(
    "Reflect",
  );
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Your little try counts." }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Let’s build!" })).toHaveCount(
    0,
  );
  await expect(page.getByRole("button", { name: "Keep going" })).toHaveCount(0);
  await page
    .getByRole("button", { name: "Skill passport", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Build self-reported" }),
  ).toBeVisible();
  await expect(page.getByText("Folded paper held its shape.")).toBeVisible();
  await page.getByRole("button", { name: "Review (demo)" }).click();
  await expect(
    page.getByRole("heading", { name: "Adult review recorded" }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/bydt-passport.png",
    fullPage: true,
    animations: "disabled",
  });
  const exported = await request.get(
    "/api/passport?profileId=demo-explorer&export=1",
  );
  expect((await exported.json()).entries).toHaveLength(3);
  await page.getByRole("button", { name: "For grown-ups" }).click();
  await expect(
    page.getByRole("heading", { name: "This week’s prep list" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Explore careers" }).click();
  await page.getByRole("textbox", { name: "Search careers" }).fill("bridge");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Civil Engineers", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ingenieros civiles" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Abrir en Curio City" }).first().click();
  await expect(
    page.getByRole("textbox", { name: "Your curiosity" }),
  ).toHaveValue(/career/);
  await page.getByLabel("Age band").selectOption("Builder_9_13");
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Tu idea" })
    .fill("Quiero construir un puente");
  await page.getByRole("button", { name: "Enviar idea" }).click();
  await expect(
    page.getByRole("button", { name: "¡Vamos a construir!" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Construye un puente de papel" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "/tmp/bydt-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.getByRole("button", { name: "Pasaporte", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(errors).toEqual([]);
  await request.delete("/api/passport?profileId=demo-explorer");
  await request.delete("/api/passport?profileId=demo-builder");
});
test("public empty/error states and keyboard access", async ({ page }) => {
  await page.goto("/explore");
  await page
    .getByRole("textbox", { name: "Search careers" })
    .fill("zzzznomatch");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Try another spark." }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search careers" }).fill("bridge");
  await page.getByRole("textbox", { name: "Search careers" }).press("Enter");
  await expect(
    page.getByRole("heading", { name: "Civil Engineers", exact: true }),
  ).toBeVisible();
  await page.route("**/api/explore*", (r) =>
    r.fulfill({ status: 503, body: "{}" }),
  );
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator(".error[role=alert]")).toContainText(
    "Search could not load",
  );
});

test("design refinements support keyboard, mobile cards and reduced motion", async ({
  page,
}) => {
  await page.route("**/api/passport?*", (route) =>
    route.fulfill({ json: { entries: [], activeAssignment: null } }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Building things" }),
  ).toBeEnabled();
  const deck = page.getByRole("region", { name: "Cape-Ability cards" });
  expect(await deck.evaluate((e) => e.scrollWidth > e.clientWidth)).toBe(true);
  const last = deck.locator("article").last();
  await last.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(last.getByText("1.D.2.d")).toBeVisible();
  const target = await last.boundingBox(),
    viewport = await deck.boundingBox();
  expect(target!.x + target!.width).toBeLessThanOrEqual(
    viewport!.x + viewport!.width + 1,
  );
  expect(await last.evaluate((e) => getComputedStyle(e).animationName)).toBe(
    "none",
  );
  const prompt = page.getByRole("button", { name: "Building things" });
  await prompt.hover();
  expect(await prompt.evaluate((e) => getComputedStyle(e).transform)).toBe(
    "none",
  );
  expect((await prompt.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Grandes ideas. Pequeños intentos." }),
  ).toBeVisible();
  await expect(page.locator(".journey-trail [aria-current=step]")).toHaveText(
    "Imagina",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await page.setViewportSize({ width: 768, height: 1024 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await expect(page.locator(".creative-signature")).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile handoff leads straight to the offline mission", async ({
  page,
  request,
}) => {
  await request.delete("/api/passport?profileId=demo-explorer");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Building things" }).click();
  await expect(
    page.getByRole("button", { name: "Let’s build!" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Follow your spark." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What are you curious about?" }),
  ).toHaveCount(0);
  const mission = await page.locator("#offline-mission").boundingBox();
  const deck = await page
    .getByRole("region", { name: "Cape-Ability cards" })
    .boundingBox();
  expect(mission!.y).toBeLessThan(deck!.y);
  for (let i = 0; i < 3; i++)
    await page.getByRole("button", { name: "Keep going" }).click();
  await page.getByRole("button", { name: "Try it offline" }).click();
  await expect(page.locator("#offline-mission")).toBeFocused();
  const action = await page
    .getByRole("button", { name: "Let’s build!" })
    .boundingBox();
  expect(action!.y).toBeGreaterThanOrEqual(0);
  expect(action!.y + action!.height).toBeLessThan(844);
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await page.getByRole("button", { name: "Probar sin pantalla" }).click();
  await expect(page.locator("#offline-mission")).toBeFocused();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  await request.delete("/api/passport?profileId=demo-explorer");
});
