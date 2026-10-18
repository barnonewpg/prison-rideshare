alias PrisonRideshareWeb.Slot

require Logger

defmodule SlotSeeds do
  def to_ecto(timex) do
    timex
    |> Timex.to_datetime()
    |> Timex.Protocol.to_naive_datetime()
  end
end

day_slots = [
  "1*12-17",
  "1*16-21"
]

first_day =
  (List.first(System.argv) || Timex.format!(NaiveDateTime.utc_now, "{YYYY}-{0M}-01"))
  |> Timex.parse!("{YYYY}-{0M}-{0D}")

days_in_month =
  first_day
  |> Timex.days_in_month()

dates_in_month =
  Enum.map(0..(days_in_month - 1), fn day_of_month ->
    Timex.shift(first_day, days: day_of_month)
  end)

Logger.info("dates in month:")
Logger.info(inspect(dates_in_month))

slots =
  Enum.flat_map(dates_in_month, fn date ->
    Enum.map(day_slots, fn day_slot ->
      [count, window] = String.split(day_slot, "*")
      [slot_start_text, slot_end_text] = String.split(window, "-")

      {date_part, _time_part} = Timex.to_erl(date)

      slot_start =
        Timex.to_datetime(
          NaiveDateTime.from_erl!({date_part, {String.to_integer(slot_start_text), 0, 0}}),
          "America/Winnipeg"
        )
        |> SlotSeeds.to_ecto()

      slot_end =
        Timex.to_datetime(
          NaiveDateTime.from_erl!({date_part, {String.to_integer(slot_end_text), 0, 0}}),
          "America/Winnipeg"
        )
        |> SlotSeeds.to_ecto()

      %Slot{
        start: slot_start,
        end: slot_end,
        count: String.to_integer(count)
      }
    end)
  end)

Logger.info(inspect(slots))

Enum.each(slots, fn slot ->
  PrisonRideshare.Repo.insert!(slot)
end)
