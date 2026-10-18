defmodule PrisonRideshareWeb.PersonControllerTest do
  use PrisonRideshareWeb.ConnCase
  use Bamboo.Test

  import Mock

  alias PrisonRideshareWeb.{Commitment, Institution, Person, Reimbursement, Ride, Slot}
  alias PrisonRideshare.Repo

  @valid_attrs %{
    name: "some content",
    email: "hello@example.com",
    mobile: "5145551313",
    medium: "mobile",
    active: false,
    self_notes: "Some self notes",
    address: "91 Albert St"
  }
  @invalid_attrs %{name: "aname"}

  setup do
    conn =
      build_conn()
      |> put_req_header("accept", "application/vnd.api+json")
      |> put_req_header("content-type", "application/vnd.api+json")
      |> put_req_header("user-agent", "HELLO")
      |> auth_as_admin

    {:ok, conn: conn}
  end

  defp relationships do
    %{}
  end

  test "lists all entries on index", %{conn: conn} do
    conn = get(conn, Routes.person_path(conn, :index))
    assert json_response(conn, 200)["data"] == []
  end

  test "filters out people who are only visitors", %{conn: conn} do
    institution = Repo.insert!(%Institution{name: "Stony Mountain"})

    new_driver = Repo.insert!(%Person{name: "New driver"})
    driver = Repo.insert!(%Person{name: "Driver"})
    car_owner = Repo.insert!(%Person{name: "Car owner"})
    reimbursed = Repo.insert!(%Person{name: "Reimbursed"})
    committed = Repo.insert!(%Person{name: "Committed"})
    visitor = Repo.insert!(%Person{name: "Visitor"})
    visitor_and_driver = Repo.insert!(%Person{name: "Visitor and driver"})

    ride = fn attrs ->
      Repo.insert!(
        struct(
          Ride,
          Map.merge(
            %{
              institution_id: institution.id,
              start: NaiveDateTime.from_erl!({{2017, 1, 15}, {18, 0, 0}}),
              end: NaiveDateTime.from_erl!({{2017, 1, 15}, {20, 0, 0}})
            },
            attrs
          )
        )
      )
    end

    visited = ride.(%{visitor_id: visitor.id, driver_id: driver.id, car_owner_id: car_owner.id})
    ride.(%{visitor_id: visitor_and_driver.id})
    ride.(%{driver_id: visitor_and_driver.id})

    Repo.insert!(%Reimbursement{person_id: reimbursed.id, ride_id: visited.id, car_expenses: 100})

    slot =
      Repo.insert!(%Slot{
        start: NaiveDateTime.from_erl!({{2117, 12, 8}, {13, 0, 0}}),
        end: NaiveDateTime.from_erl!({{2117, 12, 8}, {17, 0, 0}})
      })

    Repo.insert!(%Commitment{slot_id: slot.id, person_id: committed.id})

    conn = get(conn, Routes.person_path(conn, :index), %{"filter" => %{"role" => "driver"}})

    names =
      json_response(conn, 200)["data"]
      |> Enum.map(& &1["attributes"]["name"])
      |> Enum.sort()

    assert names ==
             Enum.sort([
               new_driver.name,
               driver.name,
               car_owner.name,
               reimbursed.name,
               committed.name,
               visitor_and_driver.name
             ])

    conn = get(conn, Routes.person_path(conn, :index))
    assert length(json_response(conn, 200)["data"]) == 7
  end

  test "includes the start of each person's latest ride as driver on index", %{conn: conn} do
    driver = Repo.insert!(%Person{name: "Driver"})
    car_owner = Repo.insert!(%Person{name: "Car owner"})
    Repo.insert!(%Person{name: "Never drove"})
    institution = Repo.insert!(%Institution{})

    Repo.insert!(%Ride{
      driver_id: driver.id,
      start: ~N[2017-01-15 18:00:00],
      institution_id: institution.id
    })

    Repo.insert!(%Ride{
      driver_id: driver.id,
      car_owner_id: car_owner.id,
      start: ~N[2018-03-01 12:00:00],
      institution_id: institution.id
    })

    last_ride_starts =
      conn
      |> get(Routes.person_path(conn, :index))
      |> json_response(200)
      |> Map.get("data")
      |> Map.new(&{&1["attributes"]["name"], &1["attributes"]["last-ride-start"]})

    assert last_ride_starts == %{
             "Driver" => "2018-03-01T12:00:00Z",
             "Car owner" => nil,
             "Never drove" => nil
           }
  end

  test "omits the latest ride start when not computed", %{conn: conn} do
    person = Repo.insert!(%Person{name: "a"})

    conn = get(conn, Routes.person_path(conn, :show, person))

    refute Map.has_key?(json_response(conn, 200)["data"]["attributes"], "last-ride-start")
  end

  test "shows chosen resource", %{conn: conn} do
    person =
      Repo.insert!(%Person{
        name: "a",
        email: "b",
        mobile: "c",
        landline: "d",
        notes: "e",
        medium: "mobile",
        active: false,
        self_notes: "notes",
        address: "91 Albert"
      })

    conn = get(conn, Routes.person_path(conn, :show, person))
    data = json_response(conn, 200)["data"]
    assert data["id"] == "#{person.id}"
    assert data["type"] == "people"

    attributes = data["attributes"]
    assert attributes["name"] == person.name
    assert attributes["email"] == person.email
    assert attributes["mobile"] == person.mobile
    assert attributes["landline"] == person.landline
    assert attributes["notes"] == person.notes
    assert attributes["medium"] == person.medium
    refute attributes["active"]
    assert attributes["self-notes"] == person.self_notes
    assert attributes["address"] == person.address
  end

  test "does not show resource and instead throw error when id is nonexistent", %{conn: conn} do
    assert_error_sent(404, fn ->
      get(conn, Routes.person_path(conn, :show, "00000000-0000-0000-0000-000000000000"))
    end)
  end

  test "creates and renders resource when data is valid", %{conn: conn} do
    conn =
      post(conn, Routes.person_path(conn, :create), %{
        "meta" => %{},
        "data" => %{
          "type" => "people",
          "attributes" => @valid_attrs,
          "relationships" => relationships()
        }
      })

    person = Repo.get_by(Person, @valid_attrs)
    assert json_response(conn, 201)["data"]["id"] == person.id

    attributes = json_response(conn, 201)["data"]["attributes"]
    assert attributes["name"] == "some content"
    assert attributes["email"] == @valid_attrs[:email]
    assert attributes["mobile"] == @valid_attrs[:mobile]
    assert attributes["address"] == @valid_attrs[:address]

    [user] = Repo.all(PrisonRideshareWeb.User)

    [version] = Repo.all(PaperTrail.Version)
    assert version.event == "insert"
    assert version.item_changes["name"] == "some content"
    assert version.meta["ip"] == "127.0.0.1"
    assert version.meta["user-agent"] == "HELLO"
    assert version.originator_id == user.id
  end

  test "does not create resource or version and renders errors when data is invalid", %{
    conn: conn
  } do
    conn =
      post(conn, Routes.person_path(conn, :create), %{
        "meta" => %{},
        "data" => %{
          "type" => "people",
          "attributes" => @invalid_attrs,
          "relationships" => relationships()
        }
      })

    assert json_response(conn, 422)["errors"] == [
             %{
               "detail" => "Email can't be blank",
               "source" => %{"pointer" => "/data/attributes/email"},
               "title" => "can't be blank"
             }
           ]

    assert Repo.all(PaperTrail.Version) == []
  end

  test "sends a calendar email to a person", %{conn: conn} do
    with_mock PrisonRideshare.PersonGuardian,
      encode_magic: fn person -> {:ok, "token for #{person.name}", "claims"} end do
      person = Repo.insert!(%Person{name: "Chelsea Manning", email: "chelsea@example.com"})

      conn =
        post(
          conn,
          Routes.person_calendar_email_path(conn, :email_calendar_link, person, "2017-12")
        )

      assert response(conn, 204)
      assert_delivered_email(PrisonRideshare.Email.calendar_link(person, "2017-12"))
    end
  end

  test "returns a calendar link", %{conn: conn} do
    person = Repo.insert!(%Person{name: "Jortle", email: "jortle@example.com"})
    conn = get(conn, Routes.person_calendar_link_path(conn, :calendar_link, person, "2018-02"))
    assert String.contains?(response(conn, 200), "2018-02")
  end

  test "updates and renders chosen resource when data is valid", %{conn: conn} do
    person = Repo.insert!(%Person{name: "oldname"})

    conn =
      put(conn, Routes.person_path(conn, :update, person), %{
        "meta" => %{},
        "data" => %{
          "type" => "people",
          "id" => person.id,
          "attributes" => @valid_attrs,
          "relationships" => relationships()
        }
      })

    person = Repo.get_by(Person, @valid_attrs)

    attributes = json_response(conn, 200)["data"]["attributes"]
    assert attributes["name"] == person.name
    assert attributes["email"] == person.email
    assert attributes["mobile"] == person.mobile
    assert attributes["medium"] == person.medium
    refute attributes["active"]
    assert attributes["address"] == person.address

    [version] = Repo.all(PaperTrail.Version)
    assert version.event == "update"
    assert version.item_changes["name"] == "some content"
    assert version.meta["ip"] == "127.0.0.1"
  end

  test "updates a visitor's notes without requiring an email", %{conn: conn} do
    institution = Repo.insert!(%Institution{})
    visitor = Repo.insert!(%Person{name: "Frida"})
    Repo.insert!(%Ride{institution_id: institution.id, visitor_id: visitor.id})

    conn =
      put(conn, Routes.person_path(conn, :update, visitor), %{
        "meta" => %{},
        "data" => %{
          "type" => "people",
          "id" => visitor.id,
          "attributes" => %{"name" => "Frida", "email" => nil, "notes" => "Uses a wheelchair"}
        }
      })

    assert json_response(conn, 200)["data"]["attributes"]["notes"] == "Uses a wheelchair"
    assert Repo.get!(Person, visitor.id).notes == "Uses a wheelchair"
  end

  test "still requires an email for drivers", %{conn: conn} do
    driver = Repo.insert!(%Person{name: "Driver", email: "driver@example.com"})

    conn =
      put(conn, Routes.person_path(conn, :update, driver), %{
        "meta" => %{},
        "data" => %{
          "type" => "people",
          "id" => driver.id,
          "attributes" => %{"email" => nil}
        }
      })

    assert json_response(conn, 422)
  end

  test "deletes chosen resource", %{conn: conn} do
    person = Repo.insert!(%Person{name: "deletedname"})
    conn = delete(conn, Routes.person_path(conn, :delete, person))
    assert response(conn, 204)
    refute Repo.get(Person, person.id)

    [version] = Repo.all(PaperTrail.Version)
    assert version.event == "delete"
    assert version.item_changes["name"] == "deletedname"
    assert version.meta["ip"] == "127.0.0.1"
  end
end
