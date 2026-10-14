defmodule PrisonRideshare.EmailTest do
  use ExUnit.Case
  alias PrisonRideshare.Email
  alias PrisonRideshareWeb.{Institution, Person, Ride}

  defp ride(start) do
    %Ride{
      start: start,
      driver: %Person{name: "Cnuth"},
      institution: %Institution{name: "Stony Mountain"}
    }
  end

  # Ride times are stored in UTC
  test "the report shows the start in Winnipeg time during daylight time" do
    email = Email.report(ride(~N[2025-07-01 23:00:00]))

    assert email.subject == "Cnuth report for 6:00 PM on Tue, Jul 1 2025"
    assert email.text_body =~ "Start of visit: 6:00 PM on Tue, Jul 1 2025"
  end

  test "the report shows the start in Winnipeg time during standard time" do
    email = Email.report(ride(~N[2025-12-02 00:00:00]))

    assert email.subject == "Cnuth report for 6:00 PM on Mon, Dec 1 2025"
  end
end
