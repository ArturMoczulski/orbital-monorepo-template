const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const cli = "node";
const orbScript = path.resolve(__dirname, "orb");

describe("orb CLI monorepo commands", () => {
  const tmpRepo = path.join(__dirname, "tmp-repo");

  beforeAll(() => {
    if (fs.existsSync(tmpRepo)) fs.rmSync(tmpRepo, { recursive: true });
    fs.mkdirSync(tmpRepo);
    execSync(`git clone --depth=1 ${process.cwd()} ${tmpRepo}`);
  });
  beforeEach(() => {
    // reset monorepo remote before each test to avoid duplication errors
    try {
      execSync(`git remote remove monorepo-template`, {
        cwd: tmpRepo,
        stdio: "ignore",
      });
    } catch {}
  });

  afterAll(() => {
    // clean up remote and temporary repos
    try {
      execSync(`git remote remove monorepo-template`, {
        cwd: tmpRepo,
        stdio: "ignore",
      });
    } catch {}
    fs.rmSync(tmpRepo, { recursive: true });
    const tmpRemoteBare = path.join(__dirname, "tmp-remote.git");
    const tmpRemoteClone = path.join(__dirname, "tmp-remote-clone");
    if (fs.existsSync(tmpRemoteBare))
      fs.rmSync(tmpRemoteBare, { recursive: true });
    if (fs.existsSync(tmpRemoteClone))
      fs.rmSync(tmpRemoteClone, { recursive: true });
  });

  test("monorepo install sets or updates remote", () => {
    const stdout = execSync(`${cli} ${orbScript} monorepo install`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout.toString()).toMatch(
      /(Added|Updated) monorepo-template remote/
    );
  });

  test("monorepo update fetches and merges without error", () => {
    execSync(`${cli} ${orbScript} monorepo install`, { cwd: tmpRepo });
    const stdout = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout.toString()).toMatch(/Monorepo updated/);
  });

  test("monorepo update merges new upstream commits", () => {
    const tmpRemoteBare = path.join(__dirname, "tmp-remote.git");
    if (fs.existsSync(tmpRemoteBare))
      fs.rmSync(tmpRemoteBare, { recursive: true });
    execSync(`git clone --bare ${process.cwd()} ${tmpRemoteBare}`);
    try {
      try {
        execSync(`git remote remove monorepo-template`, {
          cwd: tmpRepo,
          stdio: "ignore",
        });
      } catch {}
    } catch {}
    execSync(`git remote add monorepo-template file://${tmpRemoteBare}`, {
      cwd: tmpRepo,
    });
    const tmpRemoteClone = path.join(__dirname, "tmp-remote-clone");
    if (fs.existsSync(tmpRemoteClone))
      fs.rmSync(tmpRemoteClone, { recursive: true });
    execSync(`git clone ${tmpRemoteBare} ${tmpRemoteClone}`);
    fs.appendFileSync(
      path.join(tmpRemoteClone, "README.md"),
      "\nUPSTREAM CHANGE\n"
    );
    execSync(`git commit -am "upstream change"`, { cwd: tmpRemoteClone });
    execSync(`git push`, { cwd: tmpRemoteClone });
    const stdout3 = execSync(`${cli} ${orbScript} monorepo update`, {
      cwd: tmpRepo,
      encoding: "utf8",
    });
    expect(stdout3.toString()).toMatch(/Monorepo updated/);
    const readmeContent = fs.readFileSync(
      path.join(tmpRepo, "README.md"),
      "utf8"
    );
    expect(readmeContent).toMatch(/UPSTREAM CHANGE/);
  });
});
