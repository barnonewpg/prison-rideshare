defmodule Mix.Tasks.ResetSandbox do
  use Mix.Task

  @shortdoc "Reset the database with sandbox data"

  def run(_) do
    Mix.Task.run("app.config")

    # Recreate the schema rather than rolling back, so a migration recorded
    # without its changes (or vice versa) cannot block the reset.
    {:ok, _, _} =
      Ecto.Migrator.with_repo(PrisonRideshare.Repo, fn repo ->
        Ecto.Adapters.SQL.query!(repo, "DROP SCHEMA public CASCADE")
        Ecto.Adapters.SQL.query!(repo, "CREATE SCHEMA public")
      end)

    Mix.Task.run("ecto.migrate")

    Mix.Task.run("run", ["priv/repo/slots.exs"])
    Mix.Task.rerun("run", ["priv/repo/sandbox_seeds.exs"])
    Mix.Task.run("store_rates")
  end
end
